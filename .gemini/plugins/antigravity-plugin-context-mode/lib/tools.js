import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import { executeCode, runProcess, OUTPUT_CAP } from "./executor.js";
import { SNIPPET_MAX_BYTES } from "./store.js";

const EXEC_PREVIEW_BYTES = 4096;

/** Fetch URL text content */
function fetchUrlText(urlStr, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(urlStr);
      const client = parsed.protocol === "https:" ? https : http;
      const req = client.get(parsed, { timeout: timeoutMs }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchUrlText(res.headers.location, timeoutMs).then(resolve, reject);
        }
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} ${res.statusMessage}`));
        }
        const chunks = [];
        let total = 0;
        res.on("data", (c) => {
          total += c.byteLength;
          if (total <= 10 * 1024 * 1024) {
            chunks.push(c);
          }
        });
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });
      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timed out"));
      });
    } catch (e) {
      reject(e);
    }
  });
}

/** Render helper for ASCII bar chart */
function renderBar(ratio, width = 28) {
  const filled = Math.min(width, Math.max(0, Math.round(ratio * width)));
  const empty = width - filled;
  return `[${"=".repeat(filled)}${" ".repeat(empty)}]`;
}

/** Format size nicely */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Build tools registry bound to store and active context */
export function createTools({ store, getCwd = () => process.cwd(), getSessionId = () => "default" }) {
  return {
    // 1. ctx_execute
    async ctx_execute({ language = "shell", code = "", file = "", args = [], intent = "" } = {}) {
      const startTime = Date.now();
      const cwd = getCwd();
      const sessionId = getSessionId();

      const result = await executeCode({
        language,
        code,
        file,
        args,
        cwd
      });

      const elapsedMs = Date.now() - startTime;
      const fullOutput = (result.stdout ? result.stdout : "") + (result.stderr ? "\n" + result.stderr : "");
      const fullBytes = Buffer.byteLength(fullOutput, "utf8");

      let sourceId = null;
      if (fullBytes > 0) {
        const indexed = store.indexContent({
          sessionId,
          worktree: cwd,
          agent: "antigravity",
          kind: "execution",
          label: intent || `${language} script (${elapsedMs}ms)`,
          content: fullOutput
        });
        sourceId = indexed.sourceId;
      }

      const cutoffBytes = store.getCutoff(sessionId);
      // Sandbox cap is dynamically double the current cutoff setting
      const previewCapBytes = cutoffBytes > 0 ? cutoffBytes * 2 : EXEC_PREVIEW_BYTES * 8;

      let returnedText = fullOutput;
      let truncated = false;
      if (fullBytes > previewCapBytes) {
        returnedText = fullOutput.slice(0, previewCapBytes);
        truncated = true;
      }

      const returnedBytes = Buffer.byteLength(returnedText, "utf8");

      store.recordEvent({
        sessionId,
        worktree: cwd,
        agent: "antigravity",
        kind: "execution",
        tool: "ctx_execute",
        key: language,
        path: file || null,
        ok: result.ok ? 1 : 0,
        exitCode: result.exitCode,
        bytes: fullBytes,
        body: returnedText,
        sandboxBytes: fullBytes,
        returnedBytes
      });

      let responseText = returnedText;
      if (truncated) {
        responseText += `\n\n... [${formatBytes(fullBytes - returnedBytes)} truncated to protect context window; full output indexed into ${sourceId}. Use ctx_search(queries: [...], sourceId: "${sourceId}") to query it]`;
      }

      return {
        ok: result.ok,
        exitCode: result.exitCode,
        elapsedMs,
        language,
        intent: intent || null,
        sourceId,
        rawBytes: fullBytes,
        returnedBytes,
        output: responseText
      };
    },

    // 2. ctx_batch
    async ctx_batch({ commands = [], queries = [] } = {}) {
      const cwd = getCwd();
      const sessionId = getSessionId();
      const cmdList = Array.isArray(commands) ? commands : [commands];
      const outputs = [];
      let totalRawBytes = 0;

      for (const cmd of cmdList) {
        if (!cmd) continue;
        const res = await executeCode({ language: "shell", code: cmd, cwd });
        const text = `=== Command: ${cmd} (exit: ${res.exitCode}) ===\n${res.stdout || ""}${res.stderr ? "\n[stderr]\n" + res.stderr : ""}\n`;
        totalRawBytes += Buffer.byteLength(text, "utf8");
        outputs.push(text);
      }

      const combined = outputs.join("\n");
      const indexed = store.indexContent({
        sessionId,
        worktree: cwd,
        agent: "antigravity",
        kind: "batch",
        label: `batch: ${cmdList.length} commands`,
        content: combined
      });

      let returnedContent = "";
      if (queries && queries.length > 0) {
        const searchRes = store.search({
          queries,
          sourceId: indexed.sourceId,
          sessionId,
          limit: 10
        });
        returnedContent = searchRes.hits.map((h) => `[ord ${h.ord}] ${h.snippet}`).join("\n\n---\n\n");
      } else {
        returnedContent = combined.slice(0, EXEC_PREVIEW_BYTES);
        if (totalRawBytes > EXEC_PREVIEW_BYTES) {
          returnedContent += `\n\n... [truncated. Use ctx_search(queries: [...], sourceId: "${indexed.sourceId}") to search full batch output]`;
        }
      }

      const returnedBytes = Buffer.byteLength(returnedContent, "utf8");
      store.recordEvent({
        sessionId,
        worktree: cwd,
        agent: "antigravity",
        kind: "batch",
        tool: "ctx_batch",
        ok: 1,
        bytes: totalRawBytes,
        body: returnedContent,
        sandboxBytes: totalRawBytes,
        returnedBytes
      });

      return {
        commandsRun: cmdList.length,
        sourceId: indexed.sourceId,
        rawBytes: totalRawBytes,
        returnedBytes,
        content: returnedContent
      };
    },

    // 3. ctx_index
    async ctx_index({ path: filePath = "", url = "", content = "", label = "" } = {}) {
      const cwd = getCwd();
      const sessionId = getSessionId();
      let rawText = content || "";
      let resolvedLabel = label;

      if (url) {
        resolvedLabel = resolvedLabel || url;
        rawText = await fetchUrlText(url);
      } else if (filePath) {
        resolvedLabel = resolvedLabel || filePath;
        const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(cwd, filePath);
        if (!fs.existsSync(absPath)) {
          throw new Error(`File not found: ${filePath}`);
        }
        rawText = fs.readFileSync(absPath, "utf8");
      }

      if (!rawText) {
        throw new Error("No content, file path, or url provided to index");
      }

      const indexed = store.indexContent({
        sessionId,
        worktree: cwd,
        agent: "antigravity",
        kind: url ? "web" : filePath ? "file" : "text",
        label: resolvedLabel || "manual_index",
        content: rawText
      });

      const returnObj = {
        sourceId: indexed.sourceId,
        label: indexed.label,
        bytesTotal: indexed.bytesTotal,
        chunkCount: indexed.chunkCount,
        message: `Indexed ${formatBytes(indexed.bytesTotal)} into ${indexed.chunkCount} chunks. Query with ctx_search.`
      };

      const returnedBytes = Buffer.byteLength(JSON.stringify(returnObj), "utf8");

      store.recordEvent({
        sessionId,
        worktree: cwd,
        agent: "antigravity",
        kind: "index",
        tool: "ctx_index",
        path: filePath || url || null,
        ok: 1,
        bytes: indexed.bytesTotal,
        body: returnObj.message,
        sandboxBytes: indexed.bytesTotal,
        returnedBytes
      });

      return returnObj;
    },

    // 4. ctx_search
    async ctx_search({ queries = [], sourceId = null, scope = "session", limit = 5, offset = 0 } = {}) {
      const cwd = getCwd();
      const sessionId = getSessionId();

      const res = store.search({
        queries,
        sourceId,
        sessionId,
        worktree: cwd,
        scope,
        limit,
        offset
      });

      return {
        queries,
        totalMatches: res.totalMatches,
        returned: res.returned,
        offset: res.offset,
        hits: res.hits
      };
    },

    // 5. ctx_resume
    async ctx_resume({ seq = null } = {}) {
      const sessionId = getSessionId();
      if (seq !== null && seq !== undefined) {
        const ev = store.getEventBySeq(seq);
        if (!ev) throw new Error(`Event sequence #${seq} not found`);
        return { event: ev };
      }

      const state = store.getResumeState(sessionId, 5);
      const stats = store.getStats(sessionId);

      return {
        sessionId,
        stats: {
          calls: stats.calls,
          savedBytes: formatBytes(stats.keptOutBytes),
          savingsPercent: `${stats.savingsPercent}%`,
          tokensSaved: stats.tokensKeptOut
        },
        recentSources: state.recentSources,
        recentEvents: state.recentEvents
      };
    },

    // 6. ctx_stats
    async ctx_stats({ reset = false } = {}) {
      const sessionId = getSessionId();
      if (reset) {
        store.purge({ scope: "session", sessionId });
      }

      const s = store.getStats(sessionId);
      const report = [
        "────────────────────────────────────────────────────────────────────────────────",
        ` Antigravity context-mode stats [session: ${sessionId}]`,
        "────────────────────────────────────────────────────────────────────────────────",
        `  Total Operations:      ${s.calls}`,
        `  Raw Data Handled:      ${formatBytes(s.totalRawBytes)}`,
        `  Data Fed into LLM:     ${formatBytes(s.totalReturnedBytes)}`,
        `  Tokens Kept Out:       ~${s.tokensKeptOut.toLocaleString()} tokens (${formatBytes(s.keptOutBytes)})`,
        `  Reduction Rate:        ${s.savingsPercent}% saved`,
        "",
        `  Without context-mode   ${renderBar(1.0)}  ${formatBytes(s.totalRawBytes)}`,
        `  With context-mode      ${renderBar(s.totalRawBytes > 0 ? s.totalReturnedBytes / s.totalRawBytes : 0)}  ${formatBytes(s.totalReturnedBytes)}`,
        "────────────────────────────────────────────────────────────────────────────────"
      ].join("\n");

      return {
        stats: s,
        report
      };
    },

    // 7. ctx_doctor
    async ctx_doctor() {
      const doc = store.doctor();
      return {
        doctor: doc,
        runtimes: {
          node: process.version,
          platform: process.platform,
          arch: process.arch
        }
      };
    },

    // 8. ctx_purge
    async ctx_purge({ scope = "session" } = {}) {
      const sessionId = getSessionId();
      const cwd = getCwd();
      return store.purge({ scope, sessionId, worktree: cwd });
    }
  };
}

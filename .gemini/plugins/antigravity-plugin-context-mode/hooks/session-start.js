#!/usr/bin/env node
import { ContextModeStore } from "../lib/store.js";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data);
    });
  });
}

async function main() {
  await readStdin();

  try {
    const store = new ContextModeStore();
    store.clearSessionOverrides();
    store.close();
  } catch {}

  const response = {
    injectSteps: [
      {
        systemMessage: {
          systemMessage:
            "context-mode active: Tool executions are protected against context window bloat via SQLite FTS5 BM25 search and local sandboxed execution. For heavy logs, large files, or bulk queries, use ctx_execute or ctx_search."
        }
      }
    ]
  };

  process.stdout.write(JSON.stringify(response) + "\n");
}

main().catch(() => {
  process.stdout.write(JSON.stringify({}) + "\n");
});

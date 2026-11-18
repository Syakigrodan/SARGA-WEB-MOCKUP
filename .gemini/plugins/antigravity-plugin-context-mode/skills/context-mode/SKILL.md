---
name: context-mode
description: Protects the Antigravity agent context window by keeping massive tool outputs, logs, web pages, and bulk datasets out of context. Uses local SQLite FTS5 search (Porter BM25 + Trigram RRF) and sandboxed code execution (Thinking in Code). Use when analyzing large logs, inspecting multi-thousand line files, running bulk commands, or analyzing API data.
---

# Antigravity Context Mode ("Thinking in Code")

**Context Mode** keeps large tool outputs, command results, and file dumps out of your context window.
Instead of dumping megabytes of text into the conversation, Context Mode indexes data into a local SQLite FTS5 database (`~/.context-mode/context.db`) and executes short sandboxed scripts that return only the exact answer or filtered snippets.

---

## When to Use Context Mode

| Task | Traditional Tool (High Bloat) | Context Mode Solution (Zero Bloat) |
| :--- | :--- | :--- |
| **Analyzing build or server logs** | `run_command("Get-Content Logs/Editor.log")` | `ctx_execute(code: "...", intent: "Find compile errors in Editor.log")` |
| **Searching huge documentation or code** | Full `read_file` (> 400 lines) | `ctx_index(path: "...")` $\rightarrow$ `ctx_search(queries: ["..."])` |
| **Processing API JSON responses** | Fetching and dumping 5,000 JSON items | `ctx_execute(language: "javascript", code: "fetch(...)")` |
| **Running multi-command batches** | Running 10 commands in separate tool calls | `ctx_batch(commands: [...], queries: [...])` |
| **Session recovery & token stats** | Re-reading entire past conversation | `ctx_resume()` / `ctx_stats()` |

---

## Tools Reference

### 1. `ctx_execute` (Thinking in Code)
Executes a short script in a local sandbox (Node.js, Python, PowerShell, or Shell) with an execution cap and timeout. The full output is automatically indexed into SQLite FTS5, and only the compact result (or a preview if large) is returned to the context window.

```json
{
  "language": "javascript",
  "code": "const fs = require('fs'); const lines = fs.readFileSync('Logs/Editor.log', 'utf8').split('\\n'); const errors = lines.filter(l => l.includes('error CS')); console.log(JSON.stringify(errors, null, 2));",
  "intent": "Filter C# compiler errors from Editor.log"
}
```

### 2. `ctx_index`
Indexes a local file, web URL, or raw string into SQLite FTS5 chunks:
```json
{
  "path": "Documentation/Architecture.md",
  "label": "Architecture Guide"
}
```

### 3. `ctx_search`
Queries indexed chunks using Reciprocal Rank Fusion (Porter BM25 stemming + Trigram matching). Returns ranked snippets:
```json
{
  "queries": ["NullReferenceException", "ShipMovementService"],
  "limit": 5
}
```

### 4. `ctx_batch`
Executes multiple shell commands in batch. The combined outputs are indexed and filtered by your queries:
```json
{
  "commands": [
    "git status -s",
    "git log -n 5 --oneline",
    "npm test"
  ],
  "queries": ["failing", "error"]
}
```

### 5. `ctx_stats`
Generates a token savings report showing how many raw bytes and estimated tokens were kept out of the model's context window:
```json
{}
```

### 6. `ctx_doctor`
Checks SQLite database health, FTS5 availability, and active runtimes.

---

## Best Practices

1. **Write focused extraction scripts**: In `ctx_execute`, print only the final data structures or count summaries rather than raw loops.
2. **Never dump full logs**: If a log file is > 100 KB, never call `read_file` or bare `Get-Content`. Route it through `ctx_execute` or `ctx_index`.
3. **Use Trigram for identifiers**: `ctx_search` matches code symbols, GUIDs, and file paths via trigram indexing even if English stemming does not match.

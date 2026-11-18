# Context Mode Behavioral Standards

When `antigravity-plugin-context-mode` is active, agents MUST adhere to context budgeting laws:

1. **Zero Raw Log Dumps**: Never run unbounded log commands (`cat`, `Get-Content`, `type`) or read files exceeding 400 lines without pagination or line ranges.
2. **Thinking in Code**: When analyzing large files (>32 KB), parse and filter the data inside a `ctx_execute` script (Node.js, Python, or PowerShell) instead of bringing the raw file content into context.
3. **FTS5 Search Over Brute Force**: Index reference documents or massive outputs with `ctx_index` and query them with `ctx_search` using precise BM25/Trigram keywords.
4. **Token Verification**: Verify token savings and database health using `ctx_stats` and `ctx_doctor`.

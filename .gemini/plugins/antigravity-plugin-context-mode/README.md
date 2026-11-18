# Antigravity Context Mode

> **Stop context bloat. Save 90%+ of your prompt tokens. Keep your agent fast, focused, and less forgetful.**

[![npm version](https://img.shields.io/npm/v/antigravity-plugin-context-mode.svg)](https://www.npmjs.com/package/antigravity-plugin-context-mode)
[![Website](https://img.shields.io/badge/Website-domush.github.io%2Fantigravity--plugin--context--mode-10b981?style=flat&logo=github)](https://domush.github.io/antigravity-plugin-context-mode/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Runtime Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)]()
[![Antigravity App Compatible](https://img.shields.io/badge/Antigravity%20App-Native%20Plugin-6366f1.svg)]()

**Antigravity Context Mode** is a free, local-first plugin built specifically for the **Google Antigravity App**. It prevents terminal commands, build outputs, multi-megabyte source files, and massive datasets from flooding your conversation history — saving thousands of tokens per turn and stopping "agent amnesia" in its tracks.

> 🌐 **Website and Simulator:** [domush.github.io/antigravity-plugin-context-mode](https://domush.github.io/antigravity-plugin-context-mode/)

---
<img width="846" height="503" alt="image" src="https://github.com/user-attachments/assets/2b89e947-4b53-42a6-a0ad-ea744de96c41" />

## The Problem: Context Window Bloat

When an AI coding agent runs tools, standard workflows dump everything directly into your conversation history:

* Running `Get-Content Logs/Editor.log` dumps **65 KB (~16,000 tokens)** into your prompt.
* Running test suites, compiler outputs, or git diffs dumps **100+ KB** of repetitive text.
* Reading large source files or documentation dumps **thousands of lines** of irrelevant boilerplate.

### Why this hurts:
1. **Agent Amnesia**: Important system instructions, user constraints, and earlier architectural decisions get drowned out ("lost in the middle").
2. **Slower Responses**: Model evaluation and generation times climb as the context window fills up.
3. **Burned Quota & Ceilings**: You hit model context limits and rate limits after only a few turns.

---

## The Solution: How Context Mode Works

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          ANTIGRAVITY AGENT                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       Tool Call (e.g. read large file/command)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 PRE-TOOL-USE LIFECYCLE HOOK GATE                       │
│  • Blocks unbounded dumps (cat, Get-Content, git diff)                 │
│  • Enforces 8 KB cutoff for un-paged file reads                        │
│  • Automatically exempts binary media, documents, & prompt attachments │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
            Under 8 KB (Safe)                Over 8 KB (Blocked)
                    │                                │
                    ▼                                ▼
         Executes normally           Redirects to Context Mode Engine:
                                     ┌───────────────────────────────────┐
                                     │ 1. Sandboxed Code Execution       │
                                     │    (Thinking in Code)             │
                                     │ 2. SQLite FTS5 Indexing           │
                                     │ 3. BM25 + Trigram RRF Search      │
                                     └───────────────────────────────────┘
                                                     │
                                                     ▼
                                          Returns only the filtered,
                                          relevant answer to the chat!
```

1. **Smart Lifecycle Gating (`hooks.json`)**: Before a command or file read executes, Context Mode checks if it will cause a context flood. Applied identically to primary agents and subagents, the hook intercepts un-paged reads exceeding the active cutoff (default 8 KB) and unbounded dumps, guiding agents to query or sandbox the data instead.
2. **"Thinking in Code" (`ctx_execute`)**: Instead of reading a 5,000-line log into memory, the agent executes a concise local script (Node.js, Python, or PowerShell). The script filters the data in **50 ms** and returns *only* the specific answer or error to the conversation.
3. **Local SQLite FTS5 Storage (`ctx_search`, `ctx_index`)**: Raw outputs and indexed files are saved safely on your local disk in `~/.context-mode/context.db`. The agent uses reciprocal rank fusion search to fetch only the exact snippets it needs.
4. **Live Sidecar Dashboard**: A native side pane right inside the Antigravity App that displays real-time context savings across primary agents and subagents, lets you toggle file categories on the fly, and search indexed data with a click.

---

## Proven Results

Tested live on real-world build logs, source files, and datasets in the Antigravity App:

| Operation | Without Context Mode | With Context Mode | Savings |
| :--- | :---: | :---: | :---: |
| **Parsing 665-line Unity Editor.log** | 65,242 B (~16,300 tokens) | **550 B (~137 tokens)** | **99.2% saved** |
| **Full File Read on 40 KB component** | 40,960 B (~10,240 tokens) | Intercepted & paged to 50 lines (**~800 tokens**) | **92.1% saved** |
| **Searching Compiler Warnings** | Entire log dumped into chat | Top 2 ranked FTS5 snippets (**~350 tokens**) | **97.8% saved** |

---

## Quick Start & Installation

### Method 1: 1-Click CLI Installer (Fastest)
Run this command from any terminal:

```bash
npx antigravity-plugin-context-mode install
```

This automatically detects your operating system, unpacks the latest release into `~/.gemini/config/plugins/antigravity-plugin-context-mode`, and activates hooks and MCP tools. Restart the Antigravity App to activate!

> **Workspace-only install:** To install only for the current project, add `--workspace`:
> ```bash
> npx antigravity-plugin-context-mode install --workspace
> ```

---

### Method 2: Git Clone (Ideal for Easy Updates)
If you prefer managing the plugin via Git for easy `git pull` updates:

**Windows (PowerShell):**
```powershell
git clone https://github.com/Domush/antigravity-plugin-context-mode.git "$env:USERPROFILE\.gemini\config\plugins\antigravity-plugin-context-mode"
```

**macOS / Linux:**
```bash
git clone https://github.com/Domush/antigravity-plugin-context-mode.git ~/.gemini/config/plugins/antigravity-plugin-context-mode
```

**To update later:**
```bash
cd ~/.gemini/config/plugins/antigravity-plugin-context-mode && git pull
```

---

## Live Auxiliary Sidecar Dashboard

Context Mode includes a native web dashboard that opens directly in Antigravity's **Auxiliary (Side) Pane**:

* **One-Click Open Pill:** Click `[Open Context Mode Dashboard](sidecar://antigravity-plugin-context-mode/dashboard/)` in chat anytime.
* **Active / Paused Toggle:** Click the status pill in the top header to instantly pause protection when you intentionally need un-gated operations, and click again to re-activate.
* **Dynamic Version Badge:** Automatically reflects the active plugin version in the top-right header.
* **Context Saved Progress Bar:** Visual indicator displaying the exact percentage of context window preserved.
* **3-Way Scope Toggle:** Seamlessly inspect telemetry at three distinct levels:
  * **Conversation**: Metrics strictly for the active chat; clean slate on new conversations. Subagent actions within the conversation feed directly into this view.
  * **Session**: Metrics aggregated across all conversations since the app restarted. Automatically resets transient overrides on app reboot.
  * **Lifetime**: All-time cumulative database metrics and persistent totals. Changing the cutoff in Lifetime updates the baseline defaults for all new sessions and new conversations.
* **Shared Subagent Feed:** Interceptions triggered by subagents (`researcher`, `browser`, etc.) are badged by role and displayed alongside primary agent events in the same conversation feed.
* **File Category Toggles:** Clean, one-click pills for grouping exemptions without reading massive lists:
  * **Images** (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.bmp`, `.ico`, `.tiff`, `.psd`) — *Enabled by default*
  * **Documents** (`.pdf`, `.docx`, `.doc`, `.xlsx`, `.xls`, `.pptx`, `.ppt`, `.odt`, `.rtf`) — *Enabled by default*
  * **3D Models** (`.blend`, `.fbx`, `.obj`, `.gltf`, `.glb`, `.stl`, `.dae`, `.3ds`, `.step`, `.iges`) — *Enabled by default*
  * **Music** (`.mp3`, `.wav`, `.ogg`, `.flac`, `.aac`, `.m4a`, `.wma`, `.midi`) — *Enabled by default*
  * **Video** (`.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, `.flv`, `.wmv`, `.m4v`) — *Enabled by default*
  * **Archives** (`.zip`, `.tar`, `.gz`, `.7z`, `.rar`, `.wasm`) — *Enabled by default*
  * **Source Code** (`.js`, `.ts`, `.py`, `.rs`, `.go`, `.java`, `.c`, `.cpp`, `.cs`, `.html`, `.css`, etc.) — *Disabled by default to protect context*
* **Custom File Extensions:** Dedicated section displaying only user-added file extensions (e.g. `.csv`, `.parquet`, `.log`) with instant removal.
* **Chat Attachment Exemption:** Files attached directly in chat messages (`@` mentions and drag-and-drops) always bypass size cutoffs so the agent can inspect them in full.
* **Interactive Cutoff Dropdown:** Switch size cutoffs on the fly (`2 KB`, `4 KB`, `8 KB`, `16 KB`, `32 KB`, `64 KB`, or `none`). Line slice limits scale dynamically (2 KB: ≤ 50 lines, 8 KB: ≤ 200 lines, 32 KB: ≤ 800 lines).
* **Interactive FTS5 Search Inspector:** Search your indexed logs and files directly from the UI to inspect what the agent has indexed.
* **1-Click Session Purge:** Wipe session indexes and reset counters whenever you start a fresh task.

---

## Available MCP Tools

Once installed, the following 8 tools are registered in your Antigravity App:

| Tool | What It Does | Example Use Case |
| :--- | :--- | :--- |
| **`ctx_execute`** | Runs sandboxed Node.js, Python, or PowerShell scripts with token limits. | Filtering build errors, extracting JSON keys from large API responses. |
| **`ctx_search`** | Searches SQLite FTS5 using BM25 stemming and Trigram matching. | Finding error codes, method names, or stack traces in past logs. |
| **`ctx_index`** | Indexes local files, web URLs, or text into searchable chunks. | Indexing a 1,000-line documentation file or architecture spec. |
| **`ctx_batch`** | Runs multiple shell commands in batch and indexes the combined output. | Running `git status`, `git log`, and `npm test` in one compact call. |
| **`ctx_stats`** | Displays a formatted savings report and token metrics. | Checking how many tokens were saved during your session. |
| **`ctx_resume`** | Returns recent indexed sources and state pointers. | Re-orienting the agent after context compaction. |
| **`ctx_doctor`** | Checks SQLite database health, WAL mode, and active runtimes. | Verifying database integrity and platform runtimes. |
| **`ctx_purge`** | Clears stored sources and events from SQLite. | Resetting session or worktree indexes. |

---

## Configuration & Environment Variables

You can customize Context Mode's cutoffs at any time using the dashboard dropdown or environment variables:

| Variable | Default | Description |
| :--- | :---: | :--- |
| `CONTEXT_MODE_MAX_READ_BYTES` | `8192` (8 KB) | Size threshold beyond which un-paged file reads are rejected. Set `0` to disable. |
| `CONTEXT_MODE_MAX_LINE_RANGE` | *Dynamic* (or `200`) | Maximum allowable line slice range before pagination rejection (scales with cutoff). |
| `CONTEXT_MODE_MAX_OUTPUT_BYTES` | *Dynamic* (or `16384`) | Maximum raw preview bytes returned by `ctx_execute` (defaults to 2x cutoff). |
| `CONTEXT_MODE_TIMEOUT_MS` | `30000` (30s) | Execution timeout for sandboxed code snippets. |

### How to set on Windows (PowerShell):
```powershell
$env:CONTEXT_MODE_MAX_READ_BYTES = "4096"   # Enforce strict 4 KB cutoff
```

### How to set on macOS / Linux:
```bash
export CONTEXT_MODE_MAX_READ_BYTES=4096
```

---

## Privacy & Zero Dependencies

* **100% Local**: All indexed data lives on your machine in `~/.context-mode/context.db`. Zero network calls are made.
* **Zero 3rd-Party Dependencies**: Built exclusively on native Node.js (`node:sqlite` / `DatabaseSync`, `child_process`, and `http`). No native C++ builds, no `node-gyp`, and no dependency security vulnerabilities.
* **Safe Sandboxing**: Process execution in `ctx_execute` enforces strict execution timeouts and output caps to prevent runaway processes.

---

## Running Tests

Context Mode ships with a complete test suite using Node's native test runner:

```bash
npm test
```

Verifies:
* SQLite FTS5 schema initialization, chunking, Porter BM25, and Trigram search.
* Reciprocal Rank Fusion (RRF) ranking.
* Sandbox execution and process timeout termination.
* `PreToolUse` and `SessionStart` lifecycle hook gating for primary agents and subagents.
* Shared conversation dashboard linking and subagent interception event journal.
* Lifetime cutoff inheritance across new sessions and new conversations.
* Mathematically accurate context savings calculations without double-counting.
* File category toggles and custom extension management.
* Active / Paused state toggle and bypass logic.
* MCP stdio JSON-RPC protocol compliance.

---

## License

MIT © [Phillip Webber](https://github.com/Domush)

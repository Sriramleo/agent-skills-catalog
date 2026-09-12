# ⚡ Agent Skills Catalog

<div align="center">

[![NPM Version](https://img.shields.io/npm/v/@sriramdevops/agent-skills-catalog?color=cyan&label=npm)](https://www.npmjs.com/package/@sriramdevops/agent-skills-catalog)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-emerald.svg)](https://nodejs.org/)
[![Security: Read--Only](https://img.shields.io/badge/Security-Strict%20Read--Only-green.svg)](SECURITY.md)
[![Zero Telemetry](https://img.shields.io/badge/Telemetry-Zero%20(100%25%20Local)-purple.svg)](SECURITY.md)

**Universal AI Agent Skills Explorer, Search Catalog & Interactive Web Dashboard.**  
*Instantly discover, categorize, inspect, and generate prompts for all your agent skills across Antigravity, Claude Code, Cursor, Codex, Cline, and custom harnesses.*

[Quickstart](#-quickstart) • [Features](#-key-features) • [Harness Support](#-universal-harness-support) • [CLI Commands](#-cli-usage--cheatsheet) • [Web UI Guide](#-interactive-web-dashboard) • [Static Export](#-static-export--github-pages) • [Security](#-production-security--privacy) • [TypeScript SDK](#-programmatic-sdk)

</div>

---

## 🚀 Quickstart

Run directly with `npx` (no prior installation required):

```bash
npx @sriramdevops/agent-skills-catalog
```

> ⚡ **What happens:**  
> 1. Automatically scans your workspace and system for installed AI agent skills (`.agents/skills`, `~/.gemini/config/skills`, `~/.claude/skills`, `.cursor/skills`, etc.).
> 2. Parses YAML frontmatter, triggers, instructions, and bundled scripts.
> 3. Launches a lightning-fast local web dashboard and opens your browser at `http://127.0.0.1:4173`.

---

## ✨ Key Features

- **🌐 Universal Multi-Harness Discovery**: Automatically detects skills across Antigravity / Gemini, Claude Code, Cursor, Codex / OpenAI, Cline, and standard workspace folders.
- **🏷️ Intelligent Categorization & Taxonomy**: Auto-sorts skills into 10 structured domains (*Agent Ops, Testing & QA, Architecture & Backend, Frontend & Design, DevOps & Infra, Security & Compliance, AI & ML, Data & Databases, Workflow, and Docs*).
- **🎯 "When to Use" & "How to Use" Extraction**: Surfaces triggers, conditions, slash commands, and execution instructions upfront.
- **💡 Built-in AI Prompt Studio**: Generates one-click copyable prompts customized for your target agent (Claude Code, Antigravity, Cursor, OpenAI).
- **⚡ Lightning-Fast Fuzzy Search**: Instant client-side search powered by Fuse.js across 500+ skills with zero UI latency.
- **📊 Interactive Analytics Dashboard**: Visual charts of category distributions, token footprints, technology leaderboards, and asset metrics.
- **🖥️ Dual Interface (Web + CLI)**: Use the web GUI or query skills directly in your terminal (`--table`, `--search`, `view <id>`).
- **📦 Zero-Dependency Static Exporter**: Generate a standalone static HTML website ready for GitHub Pages, GitLab Pages, or documentation hosting.
- **🔒 Production-Grade Security**: Strict path traversal validation, read-only local execution, HTML sanitization, and zero telemetry.

---

## 🔌 Universal Harness Support

`agent-skills-catalog` works out-of-the-box with any agent setup:

| Harness / Tool | Default Scanned Paths | Supported Formats |
| :--- | :--- | :--- |
| **Antigravity / Gemini** | `~/.gemini/config/skills`, `.agents/skills` | `SKILL.md`, YAML frontmatter, symlinks, bundled scripts |
| **Claude Code** | `~/.claude/skills`, `.claude/skills` | `SKILL.md`, markdown workflows, custom triggers |
| **Cursor / Cline** | `.cursor/skills`, `~/.cursor/skills`, `.cline/skills` | `SKILL.md`, rulebooks, project prompts |
| **Codex / OpenAI** | `.codex/skills`, `~/.codex/skills` | `SKILL.md`, tool configs |
| **Custom / Any Folder** | `./skills`, or `-d /path/to/my-skills` | Any directory containing `SKILL.md` or `.md` files |

---

## 💻 CLI Usage & Cheatsheet

### 1. Launch Interactive Web Dashboard
```bash
# Default (opens browser at http://127.0.0.1:4173)
npx agent-skills-catalog

# Specify custom port & host
npx agent-skills-catalog --port 8080 --host 0.0.0.0

# Scan custom skill directories
npx agent-skills-catalog --dir ./my-custom-skills /opt/shared-skills
```

### 2. Search Skills in Terminal
```bash
# Search by keyword, technology, or intent
npx agent-skills-catalog --search react

# Filter by category
npx agent-skills-catalog --category agent-ops --table

# List all discovered skills in tabular format
npx agent-skills-catalog --table
```

### 3. Inspect a Specific Skill
```bash
# View full when-to-use, how-to-use, triggers, and stats
npx agent-skills-catalog view react-patterns
npx agent-skills-catalog view continuous-agent-loop
```

### 4. Export JSON or Documentation
```bash
# Dump full catalog as JSON (useful for CI/CD or scripts)
npx agent-skills-catalog --json > catalog.json

# Export standalone static website & Markdown documentation
npx agent-skills-catalog --export ./public-docs
```

---

## 🎛️ CLI Options Reference

```text
Usage: agent-skills-catalog [options] [command]

Options:
  -p, --port <port>          Port to run the web viewer server on (default: 4173)
  -H, --host <host>          Host to bind server to (default: 127.0.0.1)
  -d, --dir <dirs...>        Additional directories to scan for skills
  -w, --workspace <path>     Workspace root path (defaults to current working directory)
  --no-open                  Do not automatically open the browser
  -l, --list                 List all discovered skills in terminal
  -t, --table                Print tabular view of skills in terminal
  -s, --search <query>       Search skills in terminal
  -c, --category <category>  Filter skills by category in terminal
  --json                     Output full catalog JSON to stdout
  -e, --export <outputDir>   Export standalone static website & documentation
  -V, --version              Output the version number
  -h, --help                 Display help for command

Commands:
  view <id>                  Show full details and instructions for a specific skill
```

---

## 🌐 Interactive Web Dashboard

The web dashboard is designed for high-density exploration:

1. **Card Grid View**: Rich cards showing category pills, token footprints, when-to-use summaries, and one-click copy prompt buttons.
2. **Matrix Data Table**: Fast sortable table for scanning hundreds of skills by name, tokens, category, or assets.
3. **AI Prompt Studio**: Select an action intent (Execute, Review, Plan, Diagnose), customize your objective, and copy an optimized instruction prompt for your AI model.
4. **Skill Detail Modal**:
   - **Overview**: Formatted triggers, conditions, and slash commands.
   - **Markdown Reader**: Full `SKILL.md` rendered with syntax highlighting, alerts, and code block copy buttons.
   - **Asset Explorer**: Live viewer for bundled helper scripts (`scripts/*.sh`), reference guides, and schemas.
   - **Metadata**: File paths, symlink origins, token estimates, and raw YAML frontmatter.
5. **Analytics Dashboard**: Breakdown by category, token density, and technology leaderboards.

---

## 📦 Static Export & GitHub Pages

You can compile a zero-dependency, self-contained documentation portal with:

```bash
npx agent-skills-catalog --export ./docs
```

This generates:
- `docs/index.html` — Full interactive web application with preloaded skills data (works on any static host or local `file://` URL).
- `docs/CATALOG.md` — Complete Markdown catalog categorized by domain.
- `docs/skills.json` — Structured JSON schema of all discovered skills.

### Deploying to GitHub Pages via GitHub Actions

Add `.github/workflows/deploy-skills.yml` to your repository:

```yaml
name: Deploy Skills Catalog to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22.x
      - run: npx agent-skills-catalog --export ./dist-pages
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist-pages'
      - uses: actions/deploy-pages@v4
```

---

## 🔒 Production Security & Privacy

`agent-skills-catalog` is built following strict security best practices:

- **🛡️ Strict Path Traversal Prevention**: Resolves canonical symlinks and verifies all file reads remain within registered skill boundaries (`SecurityGuard.isPathSafe`).
- **📖 100% Read-Only Safety**: Does not modify, delete, or write files to your skill directories.
- **🚫 Zero Telemetry**: Runs entirely local and offline. No tracking, analytics, or remote API calls.
- **🧼 XSS Sanitization**: Markdown output is sanitized using `DOMPurify` before DOM rendering.
- **🛡️ HTTP Security Headers**: Serves with `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and secure CSP.

---

## 🛠️ Programmatic SDK

You can import `agent-skills-catalog` into your own Node.js or TypeScript tools:

```typescript
import { SkillScanner, SkillParser, Categorizer } from 'agent-skills-catalog';

// Scan all skills
const scanner = new SkillScanner();
const catalog = await scanner.scan({
  workspaceRoot: process.cwd(),
  customDirs: ['/path/to/custom/skills']
});

console.log(`Discovered ${catalog.totalSkills} skills!`);

for (const skill of catalog.skills) {
  console.log(`- [${skill.category}] ${skill.title}: ${skill.whenToUse}`);
}
```

---

## 📦 Installation Options

### 1. Zero-Install with `npx` (Recommended)
```bash
npx @sriramdevops/agent-skills-catalog
```

### 2. Global Installation
```bash
npm install -g @sriramdevops/agent-skills-catalog
skills-catalog --table
```

### 3. Project Dependency
```bash
npm install --save-dev @sriramdevops/agent-skills-catalog
```

---

## 🤝 Contributing

Contributions, feature requests, and suggestions are welcome!

1. Fork the repository: `https://github.com/sriramdevops/agent-skills-catalog`
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm test`
4. Commit your changes: `git commit -m 'feat: add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

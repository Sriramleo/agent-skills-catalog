# Contributing to Agent Skills Catalog

Thank you for your interest in contributing to **Agent Skills Catalog**! We are building an open, universal, local-first tool for developers and AI engineers across all harnesses (Antigravity, Claude Code, Cursor, Codex, Cline).

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **Git**

### Step-by-Step
1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/sriramleo/agent-skills-catalog.git
   cd agent-skills-catalog
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Build client & server bundles**:
   ```bash
   npm run build
   ```

5. **Run test suite**:
   ```bash
   npm test
   ```

---

## 🏗️ Architecture Overview

The codebase is organized cleanly into modular components:

- **`src/core/`**: Core logic (engine-agnostic, zero browser dependencies)
  - `scanner.ts`: Multi-harness directory discovery and symlink handling.
  - `parser.ts`: YAML frontmatter extraction, Markdown AST sectioning, tool detection.
  - `categorizer.ts`: Intelligent domain classification and tag clustering.
  - `linter.ts`: Rule engine for validating skill structure and token health.
  - `security.ts`: Path traversal firewall and canonical realpath verification.
  - `exporter.ts`: Static HTML, Markdown, and JSON export generator.
- **`src/server/`**: Lightweight Express API server & static asset handler.
- **`src/client/`**: React 18 + TailwindCSS + Lucide + Fuse.js single-page application.
- **`src/cli/`**: Commander-based CLI entrypoint (`bin/cli.js`).
- **`tests/`**: Vitest unit and integration test suites.

---

## 🔒 Security Principles

When contributing code, you **MUST** uphold our strict security model:
1. **Read-Only**: The tool must NEVER write to or mutate the user's skill repositories.
2. **Path Traversal Guard**: Always validate paths with `SecurityGuard.isPathSafe(targetPath, allowedRoots)`.
3. **Zero Telemetry**: Do NOT add any remote telemetry, analytics, or phone-home requests.
4. **XSS Prevention**: Any user-rendered Markdown must pass through `DOMPurify` before DOM injection.

---

## 📋 Pull Request Process

1. Create a descriptive branch: `git checkout -b feat/add-new-harness` or `fix/windows-path-separator`.
2. Write unit tests in `tests/` for any new parser, scanner, or categorizer functionality.
3. Ensure all tests and typechecks pass:
   ```bash
   npm run build
   npm test
   ```
4. Commit using conventional commits (`feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`).
5. Submit your Pull Request on GitHub.

---

## 📄 License
By contributing to Agent Skills Catalog, you agree that your contributions will be licensed under the [MIT License](LICENSE).

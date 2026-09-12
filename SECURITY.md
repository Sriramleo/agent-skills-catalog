# Security Policy

## Reporting Security Issues

We take the security of **Agent Skills Catalog** seriously. If you discover a security vulnerability, please report it responsibly rather than opening a public issue.

- **Email**: `security@sriram.dev` (or open a private GitHub Advisory)
- **Response Time**: We acknowledge vulnerabilities within 24 hours and aim to ship patches within 48 hours.

---

## Security Architecture & Design Principles

`agent-skills-catalog` is designed for safety and defense-in-depth:

### 1. Strict Path Traversal Prevention
- All file reads and asset previews pass through `SecurityGuard.isPathSafe()`.
- Relative traversal sequences (`..`), null bytes (`\0`), and directory escaping are blocked.
- Symlinks are resolved to their canonical realpaths and verified against allowed scanned root boundaries.

### 2. Read-Only Local Execution
- The web server and CLI perform **strictly read-only operations**.
- There are **no write endpoints**, file modification triggers, or shell command execution hooks.

### 3. Zero Telemetry & 100% Offline Capable
- The tool operates entirely on your local machine.
- No analytics, telemetry, tracking, or network callbacks are made to external servers.

### 4. HTML & XSS Sanitization
- All rendered markdown and frontmatter strings are sanitized through `DOMPurify` before mounting to the DOM.

### 5. Hardened HTTP Headers
- The embedded web server enforces security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`

import path from 'node:path';
import fs from 'node:fs';

export class SecurityGuard {
  private allowedRoots: Set<string> = new Set();

  constructor(allowedRoots: string[] = []) {
    for (const root of allowedRoots) {
      this.addAllowedRoot(root);
    }
  }

  public addAllowedRoot(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        const resolved = path.resolve(fs.realpathSync(dirPath));
        this.allowedRoots.add(resolved);
      }
    } catch {
      // Ignore unresolvable path
    }
  }

  /**
   * Validates if a target path is strictly within any of the allowed root directories.
   * Prevents path traversal vulnerabilities like ../../etc/passwd.
   */
  public isPathSafe(targetPath: string): boolean {
    if (!targetPath || typeof targetPath !== 'string') return false;

    // Check for null bytes or suspicious characters
    if (targetPath.includes('\0')) return false;

    try {
      const resolved = path.resolve(targetPath);
      let realTarget: string;
      try {
        realTarget = fs.realpathSync(resolved);
      } catch {
        realTarget = resolved;
      }

      for (const root of this.allowedRoots) {
        const rel = path.relative(root, realTarget);
        if (!rel.startsWith('..') && !path.isAbsolute(rel)) {
          return true;
        }
      }
    } catch {
      return false;
    }

    return false;
  }

  /**
   * Sanitize string input to prevent dangerous characters in web/cli contexts
   */
  public static sanitizeString(input: string): string {
    if (!input) return '';
    return input
      .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
        switch (char) {
          case '\0': return '';
          case '"': return '&quot;';
          case "'": return '&#39;';
          case '\\': return '';
          default: return char;
        }
      })
      .trim();
  }

  /**
   * Validates skill IDs to allow only safe alphanumeric, dashes, and underscores
   */
  public static isValidSkillId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    return /^[a-zA-Z0-9_-]{1,128}$/.test(id);
  }
}

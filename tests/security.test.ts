import { describe, it, expect } from 'vitest';
import { SecurityGuard } from '../src/core/security.js';
import path from 'node:path';

describe('SecurityGuard', () => {
  it('should validate allowed root directories', () => {
    const safeDir = path.resolve(process.cwd(), 'src');
    const guard = new SecurityGuard([safeDir]);

    expect(guard.isPathSafe(path.join(safeDir, 'index.ts'))).toBe(true);
    expect(guard.isPathSafe(path.join(safeDir, 'core', 'types.ts'))).toBe(true);
  });

  it('should reject path traversal attempts outside allowed roots', () => {
    const safeDir = path.resolve(process.cwd(), 'src');
    const guard = new SecurityGuard([safeDir]);

    expect(guard.isPathSafe('/etc/passwd')).toBe(false);
    expect(guard.isPathSafe(path.join(safeDir, '../../../../etc/passwd'))).toBe(false);
    expect(guard.isPathSafe(path.join(safeDir, '..', 'package.json'))).toBe(false);
  });

  it('should reject null bytes and malicious characters', () => {
    const safeDir = path.resolve(process.cwd(), 'src');
    const guard = new SecurityGuard([safeDir]);

    expect(guard.isPathSafe(`${safeDir}/file\0.txt`)).toBe(false);
    expect(guard.isPathSafe('')).toBe(false);
  });

  it('should validate skill IDs strictly', () => {
    expect(SecurityGuard.isValidSkillId('react-patterns')).toBe(true);
    expect(SecurityGuard.isValidSkillId('agent_ops_v2')).toBe(true);
    expect(SecurityGuard.isValidSkillId('testing-qa-123')).toBe(true);

    expect(SecurityGuard.isValidSkillId('../malicious')).toBe(false);
    expect(SecurityGuard.isValidSkillId('skill/sub')).toBe(false);
    expect(SecurityGuard.isValidSkillId('skill; rm -rf /')).toBe(false);
    expect(SecurityGuard.isValidSkillId('<script>')).toBe(false);
    expect(SecurityGuard.isValidSkillId('')).toBe(false);
  });

  it('should sanitize input strings', () => {
    const dirty = '<script>alert("xss")</script>';
    const clean = SecurityGuard.sanitizeString(dirty);
    expect(clean).not.toContain('"');
    expect(clean).toContain('&quot;');
  });
});

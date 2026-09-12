import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SkillParser } from '../src/core/parser.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('SkillParser', () => {
  const tmpDir = path.join(os.tmpdir(), `test-skills-${Date.now()}`);
  const skillFile = path.join(tmpDir, 'SKILL.md');

  beforeAll(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
    const content = `---
name: sample-test-skill
title: Sample Test Skill
description: A mock skill for automated testing suite.
category: testing-qa
tags: [unit-test, mock]
version: 1.2.0
author: Antigravity Team
---

# Sample Test Skill

This is the main body of the test skill.

## When to Use
Activate this skill when:
- Testing mock parser logic
- Verifying automated CI pipelines

## How to Use
1. Run the test runner
2. Assert expectations

\`\`\`bash
npm test
\`\`\`
`;
    fs.writeFileSync(skillFile, content, 'utf8');
  });

  afterAll(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  });

  it('should parse frontmatter, titles, and tags accurately', () => {
    const skill = SkillParser.parseFile(
      skillFile,
      'workspace',
      'Workspace Skill',
      tmpDir
    );

    expect(skill).not.toBeNull();
    if (!skill) return;

    expect(skill.id).toBe('sample-test-skill');
    expect(skill.title).toBe('Sample Test Skill');
    expect(skill.description).toBe('A mock skill for automated testing suite.');
    expect(skill.category).toBe('testing-qa');
    expect(skill.version).toBe('1.2.0');
    expect(skill.author).toBe('Antigravity Team');
    expect(skill.tags).toContain('unit-test');
    expect(skill.tags).toContain('mock');
  });

  it('should extract whenToUse and howToUse correctly', () => {
    const skill = SkillParser.parseFile(
      skillFile,
      'workspace',
      'Workspace Skill',
      tmpDir
    );

    expect(skill).not.toBeNull();
    if (!skill) return;

    expect(skill.whenToUse).toContain('Testing mock parser logic');
    expect(skill.howToUse).toContain('Run the test runner');
    expect(skill.stats.tokenEstimate).toBeGreaterThan(10);
  });
});

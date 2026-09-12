import { describe, it, expect } from 'vitest';
import { SkillLinter } from '../src/core/linter.js';
import { Skill } from '../src/core/types.js';

describe('SkillLinter', () => {
  const mockSkill: Skill = {
    id: 'mock-skill',
    name: 'mock-skill',
    title: 'Mock Skill',
    description: 'This is a complete mock description for testing the linter validation.',
    category: 'agent-ops',
    tags: ['agent', 'workflow'],
    detectedTools: ['Git & GitOps'],
    harness: 'workspace',
    harnessLabel: 'Workspace',
    sourceDir: '/mock/dir',
    filePath: '/mock/dir/SKILL.md',
    realFilePath: '/mock/dir/SKILL.md',
    isSymlink: false,
    whenToUse: 'Use when writing unit tests and testing linter rules.',
    howToUse: '1. Call the function\n2. Verify output',
    triggers: ['/test', 'mock'],
    prompts: ['Use mock skill'],
    workflowSnippets: ['npm test'],
    slashCommand: '/mock-skill',
    rawContent: '---\nname: mock-skill\n---\n# Mock Skill\n\nContent here.',
    frontmatter: { name: 'mock-skill' },
    assets: [],
    stats: {
      lineCount: 20,
      wordCount: 150,
      tokenEstimate: 200,
      hasScripts: false,
      hasReferences: false
    }
  };

  it('should pass clean skills without errors', () => {
    const issues = SkillLinter.lintSkill(mockSkill);
    const errors = issues.filter((i) => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('should detect empty skill files as errors', () => {
    const brokenSkill: Skill = {
      ...mockSkill,
      rawContent: ''
    };
    const issues = SkillLinter.lintSkill(brokenSkill);
    expect(issues.some((i) => i.code === 'EMPTY_SKILL_FILE')).toBe(true);
  });

  it('should detect missing descriptions as errors', () => {
    const missingDescSkill: Skill = {
      ...mockSkill,
      description: 'No description provided.'
    };
    const issues = SkillLinter.lintSkill(missingDescSkill);
    expect(issues.some((i) => i.code === 'MISSING_DESCRIPTION')).toBe(true);
  });

  it('should warn on oversized token footprints', () => {
    const hugeSkill: Skill = {
      ...mockSkill,
      stats: {
        ...mockSkill.stats,
        tokenEstimate: 12000
      }
    };
    const issues = SkillLinter.lintSkill(hugeSkill);
    expect(issues.some((i) => i.code === 'OVERSIZED_TOKEN_FOOTPRINT')).toBe(true);
  });
});

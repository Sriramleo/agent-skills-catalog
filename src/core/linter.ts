import { Skill, SkillLintIssue, LintSummary } from './types.js';
import fs from 'node:fs';

export class SkillLinter {
  public static lintSkill(skill: Skill): SkillLintIssue[] {
    const issues: SkillLintIssue[] = [];

    // 1. Check if empty content
    if (!skill.rawContent || skill.rawContent.trim().length === 0) {
      issues.push({
        severity: 'error',
        code: 'EMPTY_SKILL_FILE',
        message: 'The SKILL.md file is completely empty.',
        suggestion: 'Add YAML frontmatter and markdown documentation.'
      });
      return issues;
    }

    // 2. Check frontmatter presence
    if (Object.keys(skill.frontmatter).length === 0) {
      issues.push({
        severity: 'warning',
        code: 'MISSING_FRONTMATTER',
        message: 'No YAML frontmatter detected at the top of the file.',
        suggestion: 'Add `--- name: ... description: ... ---` frontmatter.'
      });
    }

    // 3. Check description quality
    if (!skill.description || skill.description === 'No description provided.') {
      issues.push({
        severity: 'error',
        code: 'MISSING_DESCRIPTION',
        message: 'Missing or empty skill description.',
        suggestion: 'Provide a concise 1-2 sentence description in frontmatter.'
      });
    } else if (skill.description.length < 20) {
      issues.push({
        severity: 'warning',
        code: 'SHORT_DESCRIPTION',
        message: 'Description is too short (< 20 characters).',
        suggestion: 'Elaborate on the purpose of this skill.'
      });
    }

    // 4. Check "When to use" section
    if (
      !skill.whenToUse ||
      skill.whenToUse.includes('Use whenever relevant tasks, tools, or workflows apply.')
    ) {
      issues.push({
        severity: 'warning',
        code: 'MISSING_WHEN_TO_USE',
        message: 'No explicit "When to use" trigger conditions found.',
        suggestion: 'Add a `## When to use` section with bullet points.'
      });
    }

    // 5. Check "How to use" section
    if (
      !skill.howToUse ||
      skill.howToUse.includes('Invoke this skill during your agent prompt')
    ) {
      issues.push({
        severity: 'info',
        code: 'GENERIC_HOW_TO_USE',
        message: 'Skill has generic usage instructions.',
        suggestion: 'Add step-by-step workflow instructions or command examples.'
      });
    }

    // 6. Check Token Footprint (Large skills)
    if (skill.stats.tokenEstimate > 8000) {
      issues.push({
        severity: 'warning',
        code: 'OVERSIZED_TOKEN_FOOTPRINT',
        message: `Estimated footprint is large (~${skill.stats.tokenEstimate.toLocaleString()} tokens).`,
        suggestion: 'Consider breaking large guidelines into separate reference files.'
      });
    }

    // 7. Check Symlink Target validity
    if (skill.isSymlink && skill.symlinkTarget) {
      if (!fs.existsSync(skill.realFilePath)) {
        issues.push({
          severity: 'error',
          code: 'BROKEN_SYMLINK',
          message: `Symlink target "${skill.symlinkTarget}" does not exist.`,
          suggestion: 'Fix or recreate the symlink to point to a valid directory or file.'
        });
      }
    }

    return issues;
  }

  public static lintAll(skills: Skill[]): LintSummary {
    const summaryIssues: { skillId: string; skillTitle: string; issues: SkillLintIssue[] }[] = [];
    let errorsCount = 0;
    let warningsCount = 0;
    let passedCount = 0;

    for (const skill of skills) {
      const issues = this.lintSkill(skill);
      skill.lintIssues = issues;

      if (issues.length > 0) {
        summaryIssues.push({
          skillId: skill.id,
          skillTitle: skill.title,
          issues
        });

        for (const iss of issues) {
          if (iss.severity === 'error') errorsCount++;
          if (iss.severity === 'warning') warningsCount++;
        }
      } else {
        passedCount++;
      }
    }

    return {
      totalChecked: skills.length,
      errorsCount,
      warningsCount,
      passedCount,
      issues: summaryIssues
    };
  }
}

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  Skill,
  SkillCategory,
  SkillCatalogResult,
  ScanOptions,
  HarnessInfo,
  HarnessType
} from './types.js';
import { SkillParser } from './parser.js';
import { CANONICAL_CATEGORIES } from './categorizer.js';
import { SecurityGuard } from './security.js';

interface HarnessLocation {
  harness: HarnessType;
  label: string;
  name: string;
  icon: string;
  description: string;
  isWorkspaceRelative?: boolean;
  subPath?: string;
  getPath?: (workspaceRoot: string) => string;
}

export const KNOWN_HARNESS_LOCATIONS: HarnessLocation[] = [
  {
    harness: 'workspace',
    label: 'Workspace Agents (.agents)',
    name: 'Workspace (.agents/skills)',
    icon: 'FolderGit2',
    description: 'Project-level skills stored in .agents/skills directory.',
    isWorkspaceRelative: true,
    subPath: path.join('.agents', 'skills')
  },
  {
    harness: 'claude-code',
    label: 'Claude Code (Workspace)',
    name: 'Claude Code Workspace',
    icon: 'Terminal',
    description: 'Claude Code project skills in .claude/skills.',
    isWorkspaceRelative: true,
    subPath: path.join('.claude', 'skills')
  },
  {
    harness: 'cursor',
    label: 'Cursor / Cline',
    name: 'Cursor Skills',
    icon: 'MousePointerClick',
    description: 'Skills defined for Cursor IDE in .cursor/skills.',
    isWorkspaceRelative: true,
    subPath: path.join('.cursor', 'skills')
  },
  {
    harness: 'codex',
    label: 'Codex / OpenAI',
    name: 'Codex Skills',
    icon: 'Cpu',
    description: 'Skills configured in .codex/skills.',
    isWorkspaceRelative: true,
    subPath: path.join('.codex', 'skills')
  },
  {
    harness: 'workspace',
    label: 'Standard (./skills)',
    name: 'Local ./skills',
    icon: 'Folder',
    description: 'Standard root skills directory.',
    isWorkspaceRelative: true,
    subPath: 'skills'
  },
  {
    harness: 'antigravity',
    label: 'Antigravity / Gemini (Global)',
    name: 'Antigravity Global',
    icon: 'Sparkles',
    description: 'Global agent skills stored in ~/.gemini/config/skills.',
    getPath: () => path.join(os.homedir(), '.gemini', 'config', 'skills')
  },
  {
    harness: 'claude-code',
    label: 'Claude Code (Global)',
    name: 'Claude Code Global',
    icon: 'Terminal',
    description: 'Global Claude Code skills in ~/.claude/skills.',
    getPath: () => path.join(os.homedir(), '.claude', 'skills')
  },
  {
    harness: 'cursor',
    label: 'Cursor (Global)',
    name: 'Cursor Global',
    icon: 'MousePointerClick',
    description: 'Global Cursor skills in ~/.cursor/skills.',
    getPath: () => path.join(os.homedir(), '.cursor', 'skills')
  },
  {
    harness: 'codex',
    label: 'Codex (Global)',
    name: 'Codex Global',
    icon: 'Cpu',
    description: 'Global OpenAI Codex skills in ~/.codex/skills.',
    getPath: () => path.join(os.homedir(), '.codex', 'skills')
  }
];

export class SkillScanner {
  private securityGuard: SecurityGuard;

  constructor() {
    this.securityGuard = new SecurityGuard();
  }

  /**
   * Scans for skills across all workspace and global harness paths.
   * Traverses upwards from cwd to discover project root skill directories.
   */
  public async scan(options: ScanOptions = {}): Promise<SkillCatalogResult> {
    const startTime = performance.now();
    const initialRoot = path.resolve(options.workspaceRoot || process.cwd());
    const candidateWorkspaceRoots = this.findCandidateWorkspaceRoots(initialRoot);

    const skillsMap = new Map<string, Skill>();
    const scannedLocations: string[] = [];
    const visitedRealPaths = new Set<string>();

    const candidateDirs: { dir: string; harness: HarnessType; label: string; name: string; icon: string; desc: string }[] = [];

    // 1. Gather all candidate directories (both workspace roots and global paths)
    for (const loc of KNOWN_HARNESS_LOCATIONS) {
      if (loc.isWorkspaceRelative && loc.subPath) {
        for (const wsRoot of candidateWorkspaceRoots) {
          const candidatePath = path.join(wsRoot, loc.subPath);
          candidateDirs.push({
            dir: candidatePath,
            harness: loc.harness,
            label: loc.label,
            name: loc.name,
            icon: loc.icon,
            desc: loc.description
          });
        }
      } else if (loc.getPath) {
        const candidatePath = loc.getPath(initialRoot);
        candidateDirs.push({
          dir: candidatePath,
          harness: loc.harness,
          label: loc.label,
          name: loc.name,
          icon: loc.icon,
          desc: loc.description
        });
      }
    }

    // 2. Custom user-supplied directories
    if (options.customDirs && options.customDirs.length > 0) {
      for (const custom of options.customDirs) {
        const resolved = path.resolve(custom);
        candidateDirs.push({
          dir: resolved,
          harness: 'custom',
          label: `Custom (${path.basename(resolved)})`,
          name: path.basename(resolved),
          icon: 'FolderPlus',
          desc: `Custom user directory: ${resolved}`
        });
      }
    }

    const harnessStatsMap = new Map<HarnessType, HarnessInfo>();

    for (const cand of candidateDirs) {
      if (!fs.existsSync(cand.dir)) continue;

      try {
        const realDir = fs.realpathSync(cand.dir);
        if (scannedLocations.includes(realDir)) continue;
        scannedLocations.push(realDir);
        this.securityGuard.addAllowedRoot(realDir);
      } catch {
        continue;
      }

      let countForHarness = 0;

      try {
        const entries = fs.readdirSync(cand.dir);
        for (const entry of entries) {
          if (entry.startsWith('.')) continue;

          const itemPath = path.join(cand.dir, entry);
          const skillFile = this.resolveSkillFile(itemPath);

          if (skillFile) {
            try {
              const realPath = fs.realpathSync(skillFile);
              if (visitedRealPaths.has(realPath)) {
                continue;
              }
              visitedRealPaths.add(realPath);

              this.securityGuard.addAllowedRoot(path.dirname(realPath));

              const parsed = SkillParser.parseFile(
                skillFile,
                cand.harness,
                cand.label,
                cand.dir
              );

              if (parsed) {
                skillsMap.set(parsed.id, parsed);
                countForHarness++;
              }
            } catch {
              // Ignore unreadable skill
            }
          }
        }
      } catch (err) {
        console.error(`[SkillScanner] Failed to read directory ${cand.dir}:`, err);
      }

      const existingHarness = harnessStatsMap.get(cand.harness);
      if (existingHarness) {
        existingHarness.count += countForHarness;
      } else {
        harnessStatsMap.set(cand.harness, {
          id: cand.harness,
          name: cand.name,
          icon: cand.icon,
          description: cand.desc,
          path: cand.dir,
          count: countForHarness,
          detected: countForHarness > 0
        });
      }
    }

    const skills = Array.from(skillsMap.values()).sort((a, b) =>
      a.title.localeCompare(b.title)
    );

    // Build category stats
    const categories: SkillCategory[] = CANONICAL_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      description: c.description,
      count: skills.filter((s) => s.category === c.id).length
    })).filter((c) => c.count > 0);

    // Build tags stats
    const tagCountMap = new Map<string, number>();
    for (const skill of skills) {
      for (const tag of skill.tags) {
        tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
      }
    }

    const tags = Array.from(tagCountMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    const harnesses = Array.from(harnessStatsMap.values()).filter((h) => h.count > 0);
    const scanDurationMs = Math.round(performance.now() - startTime);

    return {
      skills,
      categories,
      tags,
      harnesses,
      totalSkills: skills.length,
      scannedLocations,
      scanDurationMs,
      generatedAt: new Date().toISOString()
    };
  }

  public getSecurityGuard(): SecurityGuard {
    return this.securityGuard;
  }

  /**
   * Traverses upwards from starting directory to discover parent workspace roots (e.g. git roots)
   */
  private findCandidateWorkspaceRoots(startDir: string): string[] {
    const roots: string[] = [startDir];
    let current = startDir;

    // Up to 5 parent levels or until filesystem root
    for (let i = 0; i < 5; i++) {
      const parent = path.dirname(current);
      if (parent === current) break;
      
      // If parent has .git or .agents or skills, include it
      if (
        fs.existsSync(path.join(parent, '.git')) ||
        fs.existsSync(path.join(parent, '.agents')) ||
        fs.existsSync(path.join(parent, '.claude')) ||
        fs.existsSync(path.join(parent, 'skills'))
      ) {
        roots.push(parent);
      }
      current = parent;
    }

    return Array.from(new Set(roots));
  }

  private resolveSkillFile(itemPath: string): string | null {
    try {
      const real = fs.realpathSync(itemPath);
      const stat = fs.statSync(real);

      if (stat.isDirectory()) {
        const skillMd = path.join(real, 'SKILL.md');
        if (fs.existsSync(skillMd) && fs.statSync(skillMd).isFile()) {
          return skillMd;
        }
      } else if (stat.isFile()) {
        if (itemPath.endsWith('.md') || path.basename(itemPath) === 'SKILL.md') {
          return real;
        }
      }
    } catch {
      return null;
    }
    return null;
  }
}

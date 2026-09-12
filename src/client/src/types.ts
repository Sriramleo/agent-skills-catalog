export type HarnessType =
  | 'antigravity'
  | 'claude-code'
  | 'cursor'
  | 'codex'
  | 'cline'
  | 'workspace'
  | 'global'
  | 'custom';

export interface SkillAsset {
  name: string;
  relativePath: string;
  sizeBytes: number;
  type: 'script' | 'reference' | 'example' | 'resource' | 'other';
}

export interface SkillStats {
  lineCount: number;
  wordCount: number;
  tokenEstimate: number;
  hasScripts: boolean;
  hasReferences: boolean;
}

export interface Skill {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  harness: HarnessType;
  harnessLabel: string;
  sourceDir: string;
  filePath: string;
  realFilePath: string;
  isSymlink: boolean;
  symlinkTarget?: string;
  
  whenToUse: string;
  howToUse: string;
  triggers: string[];
  prompts: string[];
  workflowSnippets: string[];
  
  rawContent: string;
  frontmatter: Record<string, any>;
  assets: SkillAsset[];
  stats: SkillStats;
  
  version?: string;
  author?: string;
  updatedAt?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  count: number;
}

export interface HarnessInfo {
  id: HarnessType;
  name: string;
  icon: string;
  description: string;
  path: string;
  count: number;
  detected: boolean;
}

export interface SkillCatalogResult {
  skills: Skill[];
  categories: SkillCategory[];
  tags: { tag: string; count: number }[];
  harnesses: HarnessInfo[];
  totalSkills: number;
  scannedLocations: string[];
  scanDurationMs: number;
  generatedAt: string;
}

export type ViewMode = 'grid' | 'table' | 'dashboard';

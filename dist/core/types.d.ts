export type HarnessType = 'antigravity' | 'claude-code' | 'cursor' | 'codex' | 'cline' | 'workspace' | 'workflow' | 'global' | 'custom';
export type InvocationType = 'manual-slash' | 'auto-reference' | 'hybrid';
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
export interface SkillLintIssue {
    severity: 'error' | 'warning' | 'info';
    code: string;
    message: string;
    suggestion?: string;
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
    isManualSlashCommand: boolean;
    invocationType: InvocationType;
    slashCommand: string;
    overridesGlobal?: boolean;
    isOverridden?: boolean;
    overriddenPath?: string;
    detectedTools: string[];
    whenToUse: string;
    howToUse: string;
    triggers: string[];
    prompts: string[];
    workflowSnippets: string[];
    rawContent: string;
    frontmatter: Record<string, any>;
    assets: SkillAsset[];
    stats: SkillStats;
    lintIssues?: SkillLintIssue[];
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
export interface LintSummary {
    totalChecked: number;
    errorsCount: number;
    warningsCount: number;
    passedCount: number;
    issues: {
        skillId: string;
        skillTitle: string;
        issues: SkillLintIssue[];
    }[];
}
export interface SkillCatalogResult {
    version: string;
    skills: Skill[];
    categories: SkillCategory[];
    authors: {
        author: string;
        count: number;
    }[];
    tags: {
        tag: string;
        count: number;
    }[];
    tools: {
        tool: string;
        count: number;
    }[];
    harnesses: HarnessInfo[];
    totalSkills: number;
    manualSlashCount: number;
    autoReferenceCount: number;
    overriddenCount: number;
    scannedLocations: string[];
    scanDurationMs: number;
    generatedAt: string;
}
export interface ScanOptions {
    customDirs?: string[];
    includeGlobal?: boolean;
    includeWorkspace?: boolean;
    workspaceRoot?: string;
    maxDepth?: number;
    followSymlinks?: boolean;
}
//# sourceMappingURL=types.d.ts.map
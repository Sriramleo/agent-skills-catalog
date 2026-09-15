import { Skill, HarnessType } from './types.js';
export declare class SkillParser {
    /**
     * Parses a raw SKILL.md or workflow.md file and its directory assets into a rich Skill object.
     */
    static parseFile(filePath: string, harness: HarnessType, harnessLabel: string, sourceDir: string): Skill | null;
    private static extractAuthor;
    private static determineInvocationType;
    private static extractFrontmatter;
    private static formatTitle;
    private static extractFirstParagraph;
    private static extractWhenToUse;
    private static extractHowToUse;
    private static extractTriggers;
    private static extractPrompts;
    private static extractWorkflowSnippets;
    private static detectToolsAndMcp;
    private static scanAssets;
    private static calculateStats;
    private static getFileMtime;
}
//# sourceMappingURL=parser.d.ts.map
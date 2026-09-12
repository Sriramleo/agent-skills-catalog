import { Skill, SkillCatalogResult } from '../core/types.js';
export declare class TerminalView {
    static renderBanner(version?: string): void;
    static renderSummary(catalog: SkillCatalogResult): void;
    static renderTable(skills: Skill[]): void;
    static renderSkillDetail(skill: Skill): void;
}
//# sourceMappingURL=terminal-view.d.ts.map
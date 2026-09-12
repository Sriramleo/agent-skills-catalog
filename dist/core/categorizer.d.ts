import { SkillCategory } from './types.js';
export interface CategoryRule {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    keywords: string[];
}
export declare const CANONICAL_CATEGORIES: CategoryRule[];
export declare class Categorizer {
    static categorize(id: string, rawName: string, description: string, explicitCategory?: string): SkillCategory;
    static extractTags(id: string, description: string, content: string): string[];
}
//# sourceMappingURL=categorizer.d.ts.map
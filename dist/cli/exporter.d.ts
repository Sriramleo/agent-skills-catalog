import { SkillCatalogResult } from '../core/types.js';
export declare class StaticExporter {
    static exportCatalog(catalog: SkillCatalogResult, outputDir: string): Promise<{
        htmlPath: string;
        jsonPath: string;
        mdPath: string;
    }>;
    private static copyDirRecursive;
    private static generateMarkdownSummary;
    private static generateStandaloneHtml;
}
//# sourceMappingURL=exporter.d.ts.map
import { SkillScanner } from '../core/scanner.js';
import { SkillCatalogResult, ScanOptions } from '../core/types.js';
export declare function createServer(options?: ScanOptions): {
    app: import("express-serve-static-core").Express;
    getCatalog: (forceRefresh?: boolean) => Promise<SkillCatalogResult>;
    scanner: SkillScanner;
};
//# sourceMappingURL=app.d.ts.map
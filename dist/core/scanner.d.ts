import { SkillCatalogResult, ScanOptions, HarnessType } from './types.js';
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
export declare const KNOWN_HARNESS_LOCATIONS: HarnessLocation[];
export declare class SkillScanner {
    private securityGuard;
    constructor();
    scan(options?: ScanOptions): Promise<SkillCatalogResult>;
    getSecurityGuard(): SecurityGuard;
    private findCandidateWorkspaceRoots;
    private resolveSkillFile;
}
export {};
//# sourceMappingURL=scanner.d.ts.map
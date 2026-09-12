export declare class SecurityGuard {
    private allowedRoots;
    constructor(allowedRoots?: string[]);
    addAllowedRoot(dirPath: string): void;
    /**
     * Validates if a target path is strictly within any of the allowed root directories.
     * Prevents path traversal vulnerabilities like ../../etc/passwd.
     */
    isPathSafe(targetPath: string): boolean;
    /**
     * Sanitize string input to prevent dangerous characters in web/cli contexts
     */
    static sanitizeString(input: string): string;
    /**
     * Validates skill IDs to allow only safe alphanumeric, dashes, and underscores
     */
    static isValidSkillId(id: string): boolean;
}
//# sourceMappingURL=security.d.ts.map
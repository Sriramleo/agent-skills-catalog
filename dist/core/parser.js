import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { Categorizer } from './categorizer.js';
export class SkillParser {
    /**
     * Parses a raw SKILL.md file and its directory assets into a rich Skill object.
     */
    static parseFile(filePath, harness, harnessLabel, sourceDir) {
        try {
            if (!fs.existsSync(filePath))
                return null;
            let isSymlink = false;
            let symlinkTarget;
            let realFilePath = filePath;
            try {
                const lstat = fs.lstatSync(filePath);
                if (lstat.isSymbolicLink()) {
                    isSymlink = true;
                    symlinkTarget = fs.readlinkSync(filePath);
                }
                realFilePath = fs.realpathSync(filePath);
            }
            catch {
                // Fallback to normal path
            }
            // Ensure realFilePath points to a file, not a directory
            const realStat = fs.statSync(realFilePath);
            if (realStat.isDirectory()) {
                const nestedSkillMd = path.join(realFilePath, 'SKILL.md');
                if (fs.existsSync(nestedSkillMd)) {
                    realFilePath = nestedSkillMd;
                }
                else {
                    return null;
                }
            }
            const rawContent = fs.readFileSync(realFilePath, 'utf8');
            const skillDir = path.dirname(realFilePath);
            const parentDirName = path.basename(skillDir);
            const fallbackId = parentDirName && parentDirName !== 'skills'
                ? parentDirName
                : path.basename(filePath, '.md');
            const { frontmatter, content } = this.extractFrontmatter(rawContent);
            const id = String(frontmatter.name || frontmatter.id || fallbackId || 'unknown-skill')
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, '-');
            const rawTitle = String(frontmatter.title || frontmatter.name || id);
            const title = this.formatTitle(rawTitle);
            const rawDescription = String(frontmatter.description || this.extractFirstParagraph(content) || 'No description provided.').trim();
            const categoryObj = Categorizer.categorize(id, title, rawDescription, frontmatter.category);
            const explicitTags = Array.isArray(frontmatter.tags)
                ? frontmatter.tags.map(String)
                : [];
            const derivedTags = Categorizer.extractTags(id, rawDescription, content);
            const tags = Array.from(new Set([...explicitTags, ...derivedTags]));
            const whenToUse = this.extractWhenToUse(content, rawDescription);
            const howToUse = this.extractHowToUse(content);
            const triggers = this.extractTriggers(content, rawDescription);
            const prompts = this.extractPrompts(content, id, title);
            const workflowSnippets = this.extractWorkflowSnippets(content);
            const assets = this.scanAssets(skillDir);
            const stats = this.calculateStats(content, assets);
            const detectedTools = this.detectToolsAndMcp(content, rawDescription);
            const slashCommand = `/${id}`;
            return {
                id,
                name: frontmatter.name || id,
                title,
                description: rawDescription,
                category: categoryObj.id,
                tags,
                detectedTools,
                harness,
                harnessLabel,
                sourceDir,
                filePath,
                realFilePath,
                isSymlink,
                symlinkTarget,
                whenToUse,
                howToUse,
                triggers,
                prompts,
                workflowSnippets,
                slashCommand,
                rawContent,
                frontmatter,
                assets,
                stats,
                version: frontmatter.version ? String(frontmatter.version) : undefined,
                author: frontmatter.author ? String(frontmatter.author) : undefined,
                updatedAt: this.getFileMtime(realFilePath)
            };
        }
        catch (err) {
            console.error(`[SkillParser] Failed to parse ${filePath}:`, err);
            return null;
        }
    }
    static extractFrontmatter(raw) {
        if (!raw.startsWith('---')) {
            return { frontmatter: {}, content: raw };
        }
        const endIdx = raw.indexOf('\n---', 3);
        if (endIdx === -1) {
            return { frontmatter: {}, content: raw };
        }
        const yamlStr = raw.slice(3, endIdx).trim();
        const content = raw.slice(endIdx + 4).trim();
        try {
            const parsed = yaml.load(yamlStr);
            if (parsed && typeof parsed === 'object') {
                return { frontmatter: parsed, content };
            }
        }
        catch {
            // Fallback if YAML parse fails
        }
        return { frontmatter: {}, content };
    }
    static formatTitle(name) {
        return name
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .trim();
    }
    static extractFirstParagraph(content) {
        const lines = content.split('\n');
        const paras = [];
        let current = '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#'))
                continue;
            if (trimmed.length === 0) {
                if (current) {
                    paras.push(current);
                    current = '';
                }
            }
            else {
                current += (current ? ' ' : '') + trimmed;
            }
        }
        if (current)
            paras.push(current);
        return paras[0] || '';
    }
    static extractWhenToUse(content, description) {
        const match = content.match(/##+\s*(?:When to [Uu]se|Triggers|Use [Cc]ases|When to [Aa]ctivate)[^\n]*\n([\s\S]*?)(?=\n##+|$)/i);
        if (match && match[1]?.trim()) {
            return match[1].trim();
        }
        if (/use when|activate when|use this skill/i.test(description)) {
            return description;
        }
        const sentenceMatch = content.match(/(?:Use when|Activate when|Recommended when)[^.\n]+[.]/i);
        if (sentenceMatch) {
            return sentenceMatch[0].trim();
        }
        return description || 'Use whenever relevant tasks, tools, or workflows apply.';
    }
    static extractHowToUse(content) {
        const match = content.match(/##+\s*(?:How to [Uu]se|Instructions|Workflow|Quick [Ss]tart|Steps|Execution)[^\n]*\n([\s\S]*?)(?=\n##+|$)/i);
        if (match && match[1]?.trim()) {
            return match[1].trim();
        }
        const lines = content.split('\n');
        const howLines = [];
        let capturing = false;
        for (const line of lines) {
            if (capturing) {
                if (line.startsWith('## ') && !line.startsWith('### '))
                    break;
                howLines.push(line);
            }
            else if (line.startsWith('#') && /(workflow|instruction|guide|step|usage)/i.test(line)) {
                capturing = true;
            }
        }
        if (howLines.length > 0) {
            return howLines.join('\n').trim();
        }
        return 'Invoke this skill during your agent prompt or slash command. Check the full skill documentation below for step-by-step guidance.';
    }
    static extractTriggers(content, description) {
        const triggers = new Set();
        const text = `${description}\n${content}`;
        const triggerMatches = text.matchAll(/(?:trigger|when|keyword|phrase)s?:\s*([^\n]+)/gi);
        for (const match of triggerMatches) {
            if (match[1]) {
                match[1].split(/[,|;]/).forEach(t => {
                    const clean = t.replace(/[`"']/g, '').trim();
                    if (clean.length > 2)
                        triggers.add(clean);
                });
            }
        }
        const slashMatches = text.matchAll(/(?:\/|@)([a-zA-Z0-9_-]+)/g);
        for (const match of slashMatches) {
            if (match[0] && match[0].length > 2)
                triggers.add(match[0]);
        }
        return Array.from(triggers).slice(0, 10);
    }
    static extractPrompts(content, id, title) {
        const prompts = [
            `Use the "${id}" skill to help me with this task.`,
            `Apply the best practices from "${title}" skill.`
        ];
        const promptBlocks = content.matchAll(/(?:prompt|example):\s*\n```(?:markdown|text)?\n([\s\S]*?)\n```/gi);
        for (const pb of promptBlocks) {
            if (pb[1]?.trim()) {
                prompts.push(pb[1].trim());
            }
        }
        return prompts;
    }
    static extractWorkflowSnippets(content) {
        const snippets = [];
        const codeBlocks = content.matchAll(/```(?:bash|sh|zsh|json|yaml|js|ts)?\n([\s\S]*?)\n```/g);
        for (const cb of codeBlocks) {
            if (cb[1]?.trim() && cb[1].length < 400) {
                snippets.push(cb[1].trim());
            }
        }
        return snippets.slice(0, 5);
    }
    static detectToolsAndMcp(content, description) {
        const tools = new Set();
        const text = `${description} ${content}`.toLowerCase();
        const KNOWN_TOOLS = [
            { name: 'Playwright', pattern: /playwright|browser_navigate|browser_click/i },
            { name: 'Context7 MCP', pattern: /context7|query-docs|resolve-library/i },
            { name: 'Exa Neural Search', pattern: /exa[-_]search|neural[-_]search/i },
            { name: 'Docker', pattern: /docker|dockerfile|container/i },
            { name: 'Kubernetes', pattern: /kubernetes|kubectl|k8s|helm/i },
            { name: 'Git & GitOps', pattern: /git|worktree|github-ops|argo/i },
            { name: 'Jira API', pattern: /jira|ticket[-_]tracking/i },
            { name: 'PostgreSQL', pattern: /postgres|postgresql|psql/i },
            { name: 'ClickHouse', pattern: /clickhouse/i },
            { name: 'Redis', pattern: /redis/i },
            { name: 'Vitest / Jest', pattern: /vitest|jest|testing-library/i },
            { name: 'Pytest', pattern: /pytest/i },
            { name: 'FastAPI', pattern: /fastapi|pydantic/i },
            { name: 'Next.js', pattern: /next\.js|nextjs|turbopack/i },
            { name: 'Bash / Shell', pattern: /bash|zsh|scripts\/.*\.sh/i }
        ];
        for (const tool of KNOWN_TOOLS) {
            if (tool.pattern.test(text)) {
                tools.add(tool.name);
            }
        }
        return Array.from(tools);
    }
    static scanAssets(dirPath) {
        const assets = [];
        if (!fs.existsSync(dirPath))
            return assets;
        const subDirs = ['scripts', 'references', 'examples', 'resources', 'docs'];
        for (const sub of subDirs) {
            const subPath = path.join(dirPath, sub);
            if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
                try {
                    const files = fs.readdirSync(subPath);
                    for (const f of files) {
                        const fullFilePath = path.join(subPath, f);
                        const stat = fs.statSync(fullFilePath);
                        if (stat.isFile()) {
                            assets.push({
                                name: f,
                                relativePath: `${sub}/${f}`,
                                sizeBytes: stat.size,
                                type: sub === 'scripts' ? 'script' : sub === 'references' ? 'reference' : sub === 'examples' ? 'example' : 'resource'
                            });
                        }
                    }
                }
                catch {
                    // Ignore unreadable asset subfolder
                }
            }
        }
        return assets;
    }
    static calculateStats(content, assets) {
        const lines = content.split('\n');
        const words = content.split(/\s+/).filter(Boolean);
        const lineCount = lines.length;
        const wordCount = words.length;
        const tokenEstimate = Math.round(content.length / 4);
        return {
            lineCount,
            wordCount,
            tokenEstimate,
            hasScripts: assets.some(a => a.type === 'script'),
            hasReferences: assets.some(a => a.type === 'reference')
        };
    }
    static getFileMtime(filePath) {
        try {
            const stat = fs.statSync(filePath);
            return stat.mtime.toISOString();
        }
        catch {
            return new Date().toISOString();
        }
    }
}
//# sourceMappingURL=parser.js.map
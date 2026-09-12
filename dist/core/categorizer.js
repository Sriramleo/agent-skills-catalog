export const CANONICAL_CATEGORIES = [
    {
        id: 'slash-commands',
        name: 'Slash Commands & Workflows (/)',
        icon: 'Terminal',
        color: 'cyan',
        description: 'Manually executable slash commands (/plan, /review-pr, /cost-report, /quality-gate, etc.) designed for direct human invocation.',
        keywords: [
            'workflow', 'slash-command', 'command', 'user-invoked', 'manual',
            'plan', 'checkpoint', 'review-pr', 'quality-gate', 'cost-report',
            'grill-me', 'aside', 'goal', 'jira', 'pr', 'epic'
        ]
    },
    {
        id: 'agent-ops',
        name: 'Agent Ops & Orchestration',
        icon: 'Bot',
        color: 'indigo',
        description: 'Autonomous agent loops, supervisor coordination, self-evaluation, and DAG workflows.',
        keywords: [
            'agent', 'orchestrat', 'subagent', 'harness', 'continuous-loop', 'supervisor',
            'multi-agent', 'self-evaluation', 'autonomous', 'delegat', 'eval-harness',
            'decision', 'bdi', 'santa', 'team-builder', 'dispatch'
        ]
    },
    {
        id: 'testing-qa',
        name: 'Testing & QA',
        icon: 'CheckCircle2',
        color: 'emerald',
        description: 'TDD methodologies, unit & integration tests, E2E browser automation, and regression suites.',
        keywords: [
            'test', 'tdd', 'e2e', 'playwright', 'vitest', 'pytest', 'junit', 'mock',
            'coverage', 'regression', 'verification', 'browser-qa', 'webapp-testing'
        ]
    },
    {
        id: 'architecture-backend',
        name: 'Architecture & Backend',
        icon: 'Layers',
        color: 'blue',
        description: 'API design, server frameworks, distributed systems, clean architecture, and patterns.',
        keywords: [
            'backend', 'api', 'architecture', 'fastapi', 'django', 'quarkus', 'springboot',
            'nestjs', 'ktor', 'golang', 'rust', 'csharp', 'dotnet', 'hexagonal', 'microservice'
        ]
    },
    {
        id: 'frontend-design',
        name: 'Frontend & Design',
        icon: 'Layout',
        color: 'pink',
        description: 'Modern UI/UX, React, Next.js, Vue, TailwindCSS, motion systems, and accessibility.',
        keywords: [
            'frontend', 'react', 'nextjs', 'vue', 'tailwind', 'css', 'ui', 'ux', 'design',
            'motion', 'liquid-glass', 'theme', 'accessibility', 'a11y', 'component', 'styling'
        ]
    },
    {
        id: 'devops-infra',
        name: 'DevOps & Infrastructure',
        icon: 'Server',
        color: 'cyan',
        description: 'Kubernetes, Docker, NixOS, GitOps, CI/CD pipelines, homelab networking, and cloud.',
        keywords: [
            'devops', 'docker', 'kubernetes', 'k8s', 'infra', 'nix', 'homelab', 'vlan',
            'wireguard', 'gitops', 'argo', 'deploy', 'uncloud', 'pipeline', 'container'
        ]
    },
    {
        id: 'security-compliance',
        name: 'Security & Compliance',
        icon: 'Shield',
        color: 'rose',
        description: 'Vulnerability audits, authentication/authorization, HIPAA compliance, and secret safety.',
        keywords: [
            'security', 'compliance', 'hipaa', 'auth', 'vulnerability', 'audit',
            'secret', 'bounty', 'safety-guard', 'permission', 'tokens', 'jwt'
        ]
    },
    {
        id: 'ai-ml',
        name: 'AI, ML & Evaluation',
        icon: 'Cpu',
        color: 'violet',
        description: 'LLM evaluation rubrics, prompt engineering, RAG retrieval, neural search, and ML pipelines.',
        keywords: [
            'eval', 'llm', 'ml', 'mle', 'prompt', 'benchmark', 'retrieval', 'neural',
            'exa', 'context', 'token', 'judge', 'model-route', 'rag'
        ]
    },
    {
        id: 'data-analytics',
        name: 'Data & Databases',
        icon: 'Database',
        color: 'amber',
        description: 'PostgreSQL, MySQL, ClickHouse, database migrations, ETL pipelines, and high-throughput data.',
        keywords: [
            'database', 'postgres', 'mysql', 'clickhouse', 'data', 'throughput', 'etl',
            'sql', 'migration', 'redis', 'scraper', 'orm', 'prisma'
        ]
    },
    {
        id: 'workflow-productivity',
        name: 'Workflow & Productivity',
        icon: 'Zap',
        color: 'orange',
        description: 'Git workflows, planning methodologies, code reviews, debugging guides, and session management.',
        keywords: [
            'workflow', 'plan', 'review', 'git', 'debug', 'diagnos', 'session',
            'jira', 'refactor', 'worktree', 'merge', 'hookify', 'superpower'
        ]
    },
    {
        id: 'docs-content',
        name: 'Docs, Research & Content',
        icon: 'BookOpen',
        color: 'teal',
        description: 'Technical writing, documentation generation, marketing copy, deep research, and presentations.',
        keywords: [
            'doc', 'research', 'article', 'write', 'writing', 'content', 'marketing',
            'slide', 'obsidian', 'canvas', 'video', 'remotion', 'brand', 'seo'
        ]
    }
];
export class Categorizer {
    static categorize(id, rawName, description, explicitCategory, isWorkflow) {
        // 0. If it is explicitly a workflow / slash command file
        if (isWorkflow) {
            const slashCat = CANONICAL_CATEGORIES[0];
            return {
                id: slashCat.id,
                name: slashCat.name,
                icon: slashCat.icon,
                color: slashCat.color,
                description: slashCat.description,
                count: 0
            };
        }
        // 1. If explicit category matches known rules
        if (explicitCategory) {
            const match = CANONICAL_CATEGORIES.find((c) => c.id === explicitCategory.toLowerCase() || c.name.toLowerCase() === explicitCategory.toLowerCase());
            if (match) {
                return {
                    id: match.id,
                    name: match.name,
                    icon: match.icon,
                    color: match.color,
                    description: match.description,
                    count: 0
                };
            }
        }
        // 2. Score based on ID, Name, Description keywords (skipping index 0 slash-commands unless explicit)
        const textToScan = `${id} ${rawName} ${description}`.toLowerCase();
        let bestCategory = CANONICAL_CATEGORIES[9]; // default to workflow-productivity
        let highestScore = 0;
        for (let i = 1; i < CANONICAL_CATEGORIES.length; i++) {
            const cat = CANONICAL_CATEGORIES[i];
            let score = 0;
            for (const kw of cat.keywords) {
                if (textToScan.includes(kw)) {
                    score += kw.length > 4 ? 3 : 1;
                    if (id.includes(kw)) {
                        score += 5;
                    }
                }
            }
            if (score > highestScore) {
                highestScore = score;
                bestCategory = cat;
            }
        }
        return {
            id: bestCategory.id,
            name: bestCategory.name,
            icon: bestCategory.icon,
            color: bestCategory.color,
            description: bestCategory.description,
            count: 0
        };
    }
    static extractTags(id, description, content) {
        const tags = new Set();
        const fullText = `${id} ${description} ${content.slice(0, 1000)}`.toLowerCase();
        const KNOWN_TAGS = [
            'slash-command', 'manual-invocation', 'workflow', 'react', 'nextjs', 'typescript',
            'javascript', 'python', 'golang', 'rust', 'docker', 'kubernetes', 'gitops',
            'playwright', 'vitest', 'pytest', 'tdd', 'postgres', 'clickhouse', 'mysql',
            'redis', 'fastapi', 'django', 'spring-boot', 'quarkus', 'tailwind', 'llm-eval',
            'security', 'hipaa', 'seo', 'agent-loop', 'prompt-engineering', 'performance',
            'code-review', 'debugging', 'homelab'
        ];
        for (const tag of KNOWN_TAGS) {
            if (fullText.includes(tag.replace('-', ' ')) || fullText.includes(tag)) {
                tags.add(tag);
            }
        }
        const parts = id.split('-');
        if (parts.length > 1) {
            for (const part of parts) {
                if (part.length > 2 && !['and', 'the', 'for', 'with'].includes(part)) {
                    tags.add(part);
                }
            }
        }
        return Array.from(tags).slice(0, 8);
    }
}
//# sourceMappingURL=categorizer.js.map
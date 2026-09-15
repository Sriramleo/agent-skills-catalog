import pc from 'picocolors';
export class TerminalView {
    static renderBanner(version = '1.0.0') {
        console.log(`
${pc.cyan(pc.bold('⚡ AGENT SKILLS CATALOG'))} ${pc.gray(`v${version}`)}
${pc.dim('Universal AI Agent Skills Explorer & Browser')}
`);
    }
    static renderSummary(catalog) {
        this.renderBanner(catalog.version);
        console.log(`${pc.bold('Total Skills:')} ${pc.green(catalog.totalSkills)}  ${pc.gray('|')}  ${pc.bold('Scan Time:')} ${pc.yellow(`${catalog.scanDurationMs}ms`)} ${catalog.overriddenCount > 0 ? ` ${pc.gray('|')} ${pc.bold('Workspace Overrides:')} ${pc.cyan(catalog.overriddenCount)}` : ''}`);
        console.log(`\n${pc.bold(pc.underline('Harness Sources:'))}`);
        for (const h of catalog.harnesses) {
            console.log(`  ${pc.cyan('●')} ${pc.bold(h.name.padEnd(28))} ${pc.green(String(h.count).padStart(3))} skills ${pc.gray(`(${h.path})`)}`);
        }
        console.log(`\n${pc.bold(pc.underline('Categories:'))}`);
        for (const c of catalog.categories) {
            const bar = '█'.repeat(Math.max(1, Math.round((c.count / catalog.totalSkills) * 20)));
            console.log(`  ${pc.magenta('●')} ${pc.bold(c.name.padEnd(30))} ${pc.yellow(String(c.count).padStart(3))} ${pc.dim(bar)}`);
        }
        if (catalog.tools && catalog.tools.length > 0) {
            console.log(`\n${pc.bold(pc.underline('Top Detected Tools & MCP Servers:'))}`);
            const topTools = catalog.tools.slice(0, 6).map(t => `${pc.cyan(t.tool)} (${pc.yellow(t.count)})`).join(', ');
            console.log(`  ${topTools}`);
        }
        console.log('');
    }
    static renderTable(skills) {
        console.log(pc.bold(`${'ID'.padEnd(30)} ${'CATEGORY'.padEnd(24)} ${'HARNESS'.padEnd(14)} ${'TOKENS'.padStart(8)}  ${'DESCRIPTION'}`));
        console.log(pc.gray('─'.repeat(120)));
        for (const s of skills) {
            const id = pc.cyan(s.id.slice(0, 29).padEnd(30));
            const cat = pc.yellow(s.category.slice(0, 23).padEnd(24));
            const harness = pc.magenta(s.harness.slice(0, 13).padEnd(14));
            const tokens = pc.green(String(s.stats.tokenEstimate).padStart(8));
            const desc = pc.gray(s.description.slice(0, 40) + (s.description.length > 40 ? '...' : ''));
            console.log(`${id} ${cat} ${harness} ${tokens}  ${desc}`);
        }
        console.log(pc.gray('─'.repeat(120)));
        console.log(pc.dim(`Showing ${skills.length} skills.`));
    }
    static renderSkillDetail(skill) {
        console.log(`\n${pc.cyan(pc.bold('══════════════════════════════════════════════════════════════════════'))}`);
        console.log(`${pc.bold(pc.white(skill.title))} ${pc.gray(`(${skill.id})`)}`);
        console.log(`${pc.cyan(pc.bold('══════════════════════════════════════════════════════════════════════'))}`);
        console.log(`\n${pc.bold('📁 Category:')}      ${pc.yellow(skill.category)}`);
        console.log(`${pc.bold('🔌 Harness:')}       ${pc.magenta(skill.harnessLabel)} (${skill.harness})`);
        console.log(`${pc.bold('⚡ Slash Command:')} ${pc.cyan(pc.bold(skill.slashCommand))}`);
        console.log(`${pc.bold('📄 File Path:')}     ${pc.dim(skill.filePath)}`);
        if (skill.overridesGlobal) {
            console.log(`${pc.bold('🔄 Override:')}      ${pc.cyan('Overrides global skill with workspace version')}`);
        }
        if (skill.detectedTools.length > 0) {
            console.log(`${pc.bold('🛠️  Tools / MCP:')}   ${skill.detectedTools.map(t => pc.green(t)).join(', ')}`);
        }
        console.log(`${pc.bold('🏷️  Tags:')}           ${skill.tags.map(t => pc.blue(`#${t}`)).join(' ') || pc.dim('none')}`);
        console.log(`${pc.bold('📊 Stats:')}          ${skill.stats.lineCount} lines, ~${skill.stats.tokenEstimate} tokens, ${skill.assets.length} assets`);
        console.log(`\n${pc.bold(pc.underline('📌 DESCRIPTION:'))}`);
        console.log(pc.white(skill.description));
        console.log(`\n${pc.bold(pc.underline('🎯 WHEN TO USE:'))}`);
        console.log(pc.yellow(skill.whenToUse));
        console.log(`\n${pc.bold(pc.underline('🚀 HOW TO USE:'))}`);
        console.log(pc.green(skill.howToUse));
        if (skill.prompts.length > 0) {
            console.log(`\n${pc.bold(pc.underline('💡 EXAMPLE PROMPTS:'))}`);
            for (const p of skill.prompts) {
                console.log(`  ${pc.cyan('›')} ${pc.dim(p)}`);
            }
        }
        if (skill.assets.length > 0) {
            console.log(`\n${pc.bold(pc.underline('📦 BUNDLED ASSETS:'))}`);
            for (const a of skill.assets) {
                console.log(`  ${pc.magenta('•')} [${a.type}] ${a.relativePath} (${a.sizeBytes} bytes)`);
            }
        }
        console.log('');
    }
    static renderLintReport(report) {
        this.renderBanner();
        console.log(pc.bold(pc.underline('🔍 SKILLS HEALTH & LINT REPORT\n')));
        console.log(`${pc.bold('Checked:')} ${pc.white(report.totalChecked)}  ${pc.gray('|')}  ${pc.bold('Errors:')} ${report.errorsCount > 0 ? pc.red(pc.bold(report.errorsCount)) : pc.green(0)}  ${pc.gray('|')}  ${pc.bold('Warnings:')} ${report.warningsCount > 0 ? pc.yellow(report.warningsCount) : pc.green(0)}  ${pc.gray('|')}  ${pc.bold('Passed Clean:')} ${pc.green(report.passedCount)}\n`);
        if (report.issues.length === 0) {
            console.log(pc.green('🎉 All skills passed linting with zero issues!\n'));
            return;
        }
        for (const item of report.issues) {
            console.log(`${pc.bold(pc.cyan(`● ${item.skillTitle}`))} ${pc.gray(`(${item.skillId})`)}`);
            for (const iss of item.issues) {
                const badge = iss.severity === 'error'
                    ? pc.bgRed(pc.white(' ERROR '))
                    : iss.severity === 'warning'
                        ? pc.bgYellow(pc.black(' WARN '))
                        : pc.bgCyan(pc.black(' INFO '));
                console.log(`   ${badge} ${pc.white(iss.message)}`);
                if (iss.suggestion) {
                    console.log(`          ${pc.dim(`↳ Suggestion: ${iss.suggestion}`)}`);
                }
            }
            console.log('');
        }
    }
}
//# sourceMappingURL=terminal-view.js.map
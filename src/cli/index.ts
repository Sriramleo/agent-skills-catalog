import { Command } from 'commander';
import open from 'open';
import pc from 'picocolors';
import { SkillScanner } from '../core/scanner.js';
import { SkillLinter } from '../core/linter.js';
import { createServer } from '../server/app.js';
import { TerminalView } from './terminal-view.js';
import { StaticExporter } from './exporter.js';

const program = new Command();

program
  .name('agent-skills-catalog')
  .description('⚡ Universal AI Agent Skills Explorer, Catalog & Interactive Web Viewer')
  .version('1.0.0');

// Global options
program
  .option('-p, --port <port>', 'Port to run the web viewer server on', '4173')
  .option('-H, --host <host>', 'Host to bind server to', '127.0.0.1')
  .option('-d, --dir <dirs...>', 'Additional directories to scan for skills')
  .option('-w, --workspace <path>', 'Workspace root path (defaults to current directory)')
  .option('--no-open', 'Do not automatically open the browser')
  .option('-l, --list', 'List all discovered skills in terminal')
  .option('-t, --table', 'Print tabular view of skills in terminal')
  .option('-s, --search <query>', 'Search skills in terminal')
  .option('-c, --category <category>', 'Filter skills by category in terminal')
  .option('--tool <toolName>', 'Filter skills by detected tool/MCP server in terminal')
  .option('--lint', 'Run health and validation checks on all skills')
  .option('--json', 'Output full catalog JSON to stdout')
  .option('-e, --export <outputDir>', 'Export standalone static website & documentation to directory');

// Action Handler
program.action(async (options) => {
  const scanOptions = {
    workspaceRoot: options.workspace || process.cwd(),
    customDirs: options.dir || []
  };

  const scanner = new SkillScanner();

  // Mode 1: Lint All Skills
  if (options.lint) {
    const catalog = await scanner.scan(scanOptions);
    const report = SkillLinter.lintAll(catalog.skills);
    TerminalView.renderLintReport(report);
    if (report.errorsCount > 0) {
      process.exit(1);
    }
    return;
  }

  // Mode 2: Output JSON to stdout
  if (options.json) {
    const catalog = await scanner.scan(scanOptions);
    console.log(JSON.stringify(catalog, null, 2));
    return;
  }

  // Mode 3: Static Export
  if (options.export) {
    TerminalView.renderBanner();
    console.log(pc.cyan(`⚡ Scanning skills for static export...`));
    const catalog = await scanner.scan(scanOptions);
    console.log(pc.green(`✔ Discovered ${catalog.totalSkills} skills in ${catalog.scanDurationMs}ms.`));

    console.log(pc.yellow(`📦 Exporting to ${options.export}...`));
    const { htmlPath, jsonPath, mdPath } = await StaticExporter.exportCatalog(catalog, options.export);
    console.log(pc.green(`✔ Static Web App:  ${htmlPath}`));
    console.log(pc.green(`✔ Markdown Doc:    ${mdPath}`));
    console.log(pc.green(`✔ Raw JSON data:   ${jsonPath}`));
    console.log(pc.bold(`\n🎉 Export complete! You can host "${options.export}" on GitHub Pages or any static host.`));
    return;
  }

  // Mode 4: Search in terminal
  if (options.search) {
    const catalog = await scanner.scan(scanOptions);
    const query = options.search.toLowerCase();
    const matches = catalog.skills.filter(
      (s) =>
        s.id.includes(query) ||
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.tags.some((t) => t.includes(query)) ||
        s.detectedTools.some((t) => t.toLowerCase().includes(query))
    );

    TerminalView.renderBanner();
    console.log(pc.bold(`Search results for "${options.search}": (${matches.length} found)\n`));
    TerminalView.renderTable(matches);
    return;
  }

  // Mode 5: List / Table / Category / Tool Filter in terminal
  if (options.list || options.table || options.category || options.tool) {
    const catalog = await scanner.scan(scanOptions);
    let skills = catalog.skills;

    if (options.category) {
      skills = skills.filter((s) => s.category.toLowerCase() === options.category.toLowerCase());
    }

    if (options.tool) {
      skills = skills.filter((s) =>
        s.detectedTools.some((t) => t.toLowerCase() === options.tool.toLowerCase())
      );
    }

    TerminalView.renderSummary(catalog);
    TerminalView.renderTable(skills);
    return;
  }

  // Default Mode: Start interactive Web Server & Open Browser
  TerminalView.renderBanner();
  console.log(pc.cyan('⚡ Initializing Agent Skills Catalog server...'));

  const { app, getCatalog } = createServer(scanOptions);
  const port = parseInt(options.port, 10) || 4173;
  const host = options.host || '127.0.0.1';

  // Preload catalog
  const initialCatalog = await getCatalog();
  console.log(
    pc.green(
      `✔ Scanned ${pc.bold(initialCatalog.totalSkills)} skills across ${initialCatalog.harnesses.length} harnesses in ${initialCatalog.scanDurationMs}ms.`
    )
  );

  const server = app.listen(port, host, () => {
    const url = `http://${host}:${port}`;
    console.log(`\n🚀 ${pc.bold('Interactive Web Viewer running at:')} ${pc.cyan(pc.underline(url))}`);
    console.log(`${pc.dim('Press Ctrl+C to stop the server.\n')}`);

    if (options.open !== false) {
      open(url).catch(() => {
        // Silently ignore if browser fails to open automatically
      });
    }
  });

  process.on('SIGINT', () => {
    console.log(`\n${pc.yellow('Stopping server...')}`);
    server.close(() => process.exit(0));
  });
});

// View specific skill command
program
  .command('view <id>')
  .description('Show full details and instructions for a specific skill')
  .action(async (id) => {
    const parentOpts = program.opts();
    const scanner = new SkillScanner();
    const catalog = await scanner.scan({
      workspaceRoot: parentOpts.workspace || process.cwd(),
      customDirs: parentOpts.dir || []
    });

    const skill = catalog.skills.find(
      (s) => s.id.toLowerCase() === id.toLowerCase() || s.name.toLowerCase() === id.toLowerCase()
    );

    if (!skill) {
      console.error(pc.red(`Error: Skill "${id}" not found.`));
      process.exit(1);
    }

    TerminalView.renderSkillDetail(skill);
  });

// Lint command
program
  .command('lint')
  .description('Run health and validation checks on all discovered skills')
  .action(async () => {
    const parentOpts = program.opts();
    const scanner = new SkillScanner();
    const catalog = await scanner.scan({
      workspaceRoot: parentOpts.workspace || process.cwd(),
      customDirs: parentOpts.dir || []
    });

    const report = SkillLinter.lintAll(catalog.skills);
    TerminalView.renderLintReport(report);
    if (report.errorsCount > 0) {
      process.exit(1);
    }
  });

program.parse(process.argv);

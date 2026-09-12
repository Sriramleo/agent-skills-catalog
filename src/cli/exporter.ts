import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SkillCatalogResult } from '../core/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StaticExporter {
  public static async exportCatalog(
    catalog: SkillCatalogResult,
    outputDir: string
  ): Promise<{ htmlPath: string; jsonPath: string; mdPath: string }> {
    const resolvedOut = path.resolve(outputDir);
    if (!fs.existsSync(resolvedOut)) {
      fs.mkdirSync(resolvedOut, { recursive: true });
    }

    // 1. Export JSON data
    const jsonPath = path.join(resolvedOut, 'skills.json');
    fs.writeFileSync(jsonPath, JSON.stringify(catalog, null, 2), 'utf8');

    // 2. Export Markdown summary
    const mdPath = path.join(resolvedOut, 'CATALOG.md');
    const mdContent = this.generateMarkdownSummary(catalog);
    fs.writeFileSync(mdPath, mdContent, 'utf8');

    // 3. Export Static Web App
    const htmlPath = path.join(resolvedOut, 'index.html');
    
    // Copy bundled client assets if available, and inject embedded catalog data
    const possibleClientDist = [
      path.resolve(__dirname, '../client'),
      path.resolve(__dirname, '../../dist/client'),
      path.resolve(process.cwd(), 'dist/client')
    ];

    let clientDist = '';
    for (const p of possibleClientDist) {
      if (fs.existsSync(path.join(p, 'index.html'))) {
        clientDist = p;
        break;
      }
    }

    if (clientDist) {
      // Copy all assets
      this.copyDirRecursive(clientDist, resolvedOut);
      // Read copied index.html and inject preloaded data
      let html = fs.readFileSync(path.join(resolvedOut, 'index.html'), 'utf8');
      const dataScript = `<script>window.__PRELOADED_CATALOG__ = ${JSON.stringify(catalog)};</script>`;
      html = html.replace('</head>', `${dataScript}\n</head>`);
      fs.writeFileSync(htmlPath, html, 'utf8');
    } else {
      // Fallback standalone HTML
      const fallbackHtml = this.generateStandaloneHtml(catalog);
      fs.writeFileSync(htmlPath, fallbackHtml, 'utf8');
    }

    return { htmlPath, jsonPath, mdPath };
  }

  private static copyDirRecursive(src: string, dest: string): void {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private static generateMarkdownSummary(catalog: SkillCatalogResult): string {
    const lines: string[] = [];
    lines.push(`# Agent Skills Catalog`);
    lines.push(`> Generated on ${new Date(catalog.generatedAt).toLocaleString()} — **${catalog.totalSkills}** Total Skills\n`);

    lines.push(`## 📊 Categories Breakdown\n`);
    lines.push(`| Category | Skills Count | Description |`);
    lines.push(`| :--- | :--- | :--- |`);
    for (const c of catalog.categories) {
      lines.push(`| **${c.name}** | \`${c.count}\` | ${c.description} |`);
    }

    lines.push(`\n## 🔌 Harness Sources\n`);
    for (const h of catalog.harnesses) {
      lines.push(`- **${h.name}**: \`${h.count}\` skills (${h.path})`);
    }

    lines.push(`\n## 📚 Skills Directory\n`);

    for (const cat of catalog.categories) {
      lines.push(`\n### ${cat.name} (${cat.count})\n`);
      const catSkills = catalog.skills.filter(s => s.category === cat.id);

      for (const s of catSkills) {
        lines.push(`#### 🔹 ${s.title} (\`${s.id}\`)`);
        lines.push(`- **Description**: ${s.description}`);
        lines.push(`- **When to Use**: ${s.whenToUse}`);
        lines.push(`- **Harness**: \`${s.harnessLabel}\` | **Tokens**: \`~${s.stats.tokenEstimate}\``);
        if (s.tags.length > 0) {
          lines.push(`- **Tags**: ${s.tags.map(t => `\`#${t}\``).join(' ')}`);
        }
        lines.push(``);
      }
    }

    return lines.join('\n');
  }

  private static generateStandaloneHtml(catalog: SkillCatalogResult): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Agent Skills Catalog</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-8">
  <div class="max-w-7xl mx-auto">
    <header class="mb-10 pb-6 border-b border-slate-800 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          Agent Skills Catalog
        </h1>
        <p class="text-slate-400 mt-1">${catalog.totalSkills} Skills Discovered across ${catalog.harnesses.length} Harnesses</p>
      </div>
      <div class="text-right text-xs text-slate-500">
        Generated: ${new Date(catalog.generatedAt).toLocaleDateString()}
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${catalog.skills.map(s => `
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              ${s.category}
            </span>
            <span class="text-xs text-slate-500">~${s.stats.tokenEstimate} tok</span>
          </div>
          <h2 class="text-lg font-bold text-white mb-1">${s.title}</h2>
          <p class="text-xs font-mono text-cyan-400 mb-3">${s.id}</p>
          <p class="text-sm text-slate-300 line-clamp-3 mb-4">${s.description}</p>
          <div class="bg-slate-950/80 rounded p-3 text-xs text-slate-400 border border-slate-800/80 mb-3">
            <strong class="text-amber-400">When to use:</strong> ${s.whenToUse}
          </div>
          <div class="flex flex-wrap gap-1 mt-auto">
            ${s.tags.slice(0, 4).map(t => `<span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">#${t}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
  }
}

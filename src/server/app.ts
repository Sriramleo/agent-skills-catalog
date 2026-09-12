import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SkillScanner } from '../core/scanner.js';
import { SkillCatalogResult, ScanOptions } from '../core/types.js';
import { SecurityGuard } from '../core/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer(options: ScanOptions = {}) {
  const app = express();
  const scanner = new SkillScanner();
  let cachedCatalog: SkillCatalogResult | null = null;
  let lastScanTime = 0;

  // Security Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json());

  // Helper to fetch or refresh catalog
  async function getCatalog(forceRefresh = false): Promise<SkillCatalogResult> {
    const now = Date.now();
    // Cache for 10 seconds unless forced
    if (!cachedCatalog || forceRefresh || now - lastScanTime > 10000) {
      cachedCatalog = await scanner.scan(options);
      lastScanTime = now;
    }
    return cachedCatalog;
  }

  // --- REST API ENDPOINTS ---

  // Get entire catalog with metadata
  app.get('/api/catalog', async (req: Request, res: Response) => {
    try {
      const catalog = await getCatalog(req.query.refresh === 'true');
      res.json({
        success: true,
        data: catalog
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Query and filter skills
  app.get('/api/skills', async (req: Request, res: Response) => {
    try {
      const catalog = await getCatalog();
      let filtered = [...catalog.skills];

      const { category, harness, tag, q } = req.query;

      if (category && typeof category === 'string') {
        filtered = filtered.filter((s) => s.category.toLowerCase() === category.toLowerCase());
      }

      if (harness && typeof harness === 'string') {
        filtered = filtered.filter((s) => s.harness.toLowerCase() === harness.toLowerCase());
      }

      if (tag && typeof tag === 'string') {
        filtered = filtered.filter((s) => s.tags.includes(tag.toLowerCase()));
      }

      if (q && typeof q === 'string') {
        const query = q.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.id.includes(query) ||
            s.title.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query) ||
            s.whenToUse.toLowerCase().includes(query) ||
            s.tags.some((t) => t.includes(query))
        );
      }

      res.json({
        success: true,
        count: filtered.length,
        total: catalog.totalSkills,
        data: filtered
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get specific skill by ID
  app.get('/api/skills/:id', async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id || !SecurityGuard.isValidSkillId(id)) {
        return res.status(400).json({ success: false, error: 'Invalid skill ID' });
      }

      const catalog = await getCatalog();
      const skill = catalog.skills.find((s) => s.id === id);

      if (!skill) {
        return res.status(404).json({ success: false, error: 'Skill not found' });
      }

      res.json({ success: true, data: skill });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Safe Asset File Retrieval
  app.get('/api/skills/:id/asset', async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const assetPath = req.query.path as string;

      if (!id || !SecurityGuard.isValidSkillId(id) || !assetPath) {
        return res.status(400).json({ success: false, error: 'Invalid parameters' });
      }

      const catalog = await getCatalog();
      const skill = catalog.skills.find((s) => s.id === id);

      if (!skill) {
        return res.status(404).json({ success: false, error: 'Skill not found' });
      }

      const skillDir = path.dirname(skill.realFilePath);
      const targetFile = path.resolve(skillDir, assetPath);

      // Enforce strict security guardrail: must be inside skill directory
      const security = scanner.getSecurityGuard();
      if (!security.isPathSafe(targetFile) || !targetFile.startsWith(skillDir)) {
        return res.status(403).json({ success: false, error: 'Forbidden: Access outside skill directory' });
      }

      if (!fs.existsSync(targetFile)) {
        return res.status(404).json({ success: false, error: 'Asset file not found' });
      }

      const content = fs.readFileSync(targetFile, 'utf8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(content);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Rescan endpoint
  app.post('/api/rescan', async (_req: Request, res: Response) => {
    try {
      const catalog = await getCatalog(true);
      res.json({ success: true, message: 'Rescanned successfully', data: catalog });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Linter endpoint
  app.get('/api/lint', async (_req: Request, res: Response) => {
    try {
      const catalog = await getCatalog();
      const { SkillLinter } = await import('../core/linter.js');
      const lintSummary = SkillLinter.lintAll(catalog.skills);
      res.json({ success: true, data: lintSummary });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Static Client Hosting
  // Look for built client in ../client (dist/client or dist/src/client)
  const possibleClientPaths = [
    path.resolve(__dirname, '../client'),
    path.resolve(__dirname, '../../dist/client'),
    path.resolve(process.cwd(), 'dist/client')
  ];

  let clientDir = '';
  for (const p of possibleClientPaths) {
    if (fs.existsSync(path.join(p, 'index.html'))) {
      clientDir = p;
      break;
    }
  }

  if (clientDir) {
    app.use(express.static(clientDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  } else {
    // If client build not found, return friendly API landing page
    app.get('/', async (_req: Request, res: Response) => {
      const catalog = await getCatalog();
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
            <title>Agent Skills Catalog</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
              .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; }
              h1 { color: #38bdf8; }
              a { color: #818cf8; text-decoration: none; }
              .badge { background: #0284c7; color: #fff; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.8rem; }
            </style>
          </head>
          <body>
            <h1>Agent Skills Catalog API</h1>
            <p>Found <strong>${catalog.totalSkills}</strong> installed agent skills.</p>
            <p>API Endpoints:</p>
            <ul>
              <li><a href="/api/catalog">/api/catalog</a> - Full catalog JSON</li>
              <li><a href="/api/skills">/api/skills</a> - Filterable list</li>
            </ul>
          </body>
        </html>
      `);
    });
  }

  return { app, getCatalog, scanner };
}

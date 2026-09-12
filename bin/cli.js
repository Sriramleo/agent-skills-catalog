#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distEntry = path.resolve(__dirname, '../dist/cli/index.js');

if (fs.existsSync(distEntry)) {
  import(distEntry);
} else {
  // If not yet compiled, run via tsx or throw clear build error
  console.error('[agent-skills-catalog] Project not yet built. Please run `npm run build` or use `npx tsx src/cli/index.ts`.');
  process.exit(1);
}

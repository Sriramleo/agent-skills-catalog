import { SkillScanner } from '../src/index.js';

async function main() {
  const scanner = new SkillScanner();
  const catalog = await scanner.scan({
    workspaceRoot: '/Users/sriram/Documents/AI-Project'
  });
  console.log('=== SKILL CATALOG SUMMARY ===');
  console.log('Total Skills:', catalog.totalSkills);
  console.log('Scanned in:', catalog.scanDurationMs, 'ms');
  console.log('Harnesses detected:');
  for (const h of catalog.harnesses) {
    console.log(` - ${h.name}: ${h.count} skills`);
  }
  console.log('\nCategories breakdown:');
  for (const c of catalog.categories) {
    console.log(` - ${c.name} (${c.id}): ${c.count} skills`);
  }
  console.log('\nSample 3 skills:');
  for (const s of catalog.skills.slice(0, 3)) {
    console.log(`\n--- [${s.category}] ${s.title} (${s.id}) ---`);
    console.log(`Description: ${s.description.slice(0, 100)}...`);
    console.log(`When to use: ${s.whenToUse.slice(0, 120)}...`);
    console.log(`How to use: ${s.howToUse.slice(0, 120)}...`);
    console.log(`Tags: ${s.tags.join(', ')}`);
    console.log(`Assets: ${s.assets.length} items`);
    console.log(`Stats: ${s.stats.lineCount} lines, ~${s.stats.tokenEstimate} tokens`);
  }
}

main().catch(console.error);

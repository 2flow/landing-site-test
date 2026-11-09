/**
 * Validates content for one site (SITE=…) or all sites.
 *   npm run validate              → all sites
 *   SITE=moon-hq npm run validate → one site
 */
import fs from "node:fs";
import path from "node:path";
import { repoRoot, validateSite } from "@landing/core/server";

const sitesDir = path.join(repoRoot(), "sites");
const sites = process.env.SITE
  ? [process.env.SITE]
  : fs.readdirSync(sitesDir).filter((d) => fs.existsSync(path.join(sitesDir, d, "site.json")));

let failed = false;
for (const site of sites) {
  const problems = validateSite(site);
  if (problems.length) {
    failed = true;
    console.error(`✗ ${site}: ${problems.length} problem(s)\n`);
    for (const p of problems) console.error(`  • ${p.replace(/\n/g, "\n    ")}\n`);
  } else {
    console.log(`✓ ${site}: content valid`);
  }
}
process.exit(failed ? 1 : 0);

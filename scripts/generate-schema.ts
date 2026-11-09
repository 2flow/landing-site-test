/**
 * Generates JSON Schema files from the Zod schemas so editors (and AI
 * agents) get autocomplete + inline validation in content JSON files.
 * Run after changing packages/blocks/src/schemas.ts:  npm run schema
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { layoutSchema, pageSchema, siteSchema } from "@landing/blocks/schemas";
import { repoRoot } from "@landing/core/server";

const out = path.join(repoRoot(), "schemas");
fs.mkdirSync(out, { recursive: true });

const targets = { "site.schema.json": siteSchema, "layout.schema.json": layoutSchema, "page.schema.json": pageSchema };
for (const [file, schema] of Object.entries(targets)) {
  const json = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" });
  fs.writeFileSync(path.join(out, file), JSON.stringify(json, null, 2) + "\n");
  console.log(`wrote schemas/${file}`);
}

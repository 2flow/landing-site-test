/**
 * Build-time content loading. Runs in Node only (loaders during prerender,
 * the validate script). Never import this from components.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  layoutSchema,
  pageSchema,
  siteSchema,
  type Layout,
  type Page,
  type Site,
} from "@landing/blocks/schemas";
import { pagePath } from "./index.ts";

export { pagePath, slugFromSplat } from "./index.ts";

/** Which site to build. Set with SITE=<folder name>. */
export function currentSiteId() {
  return process.env.SITE || "moon-hq";
}

/** Repo root = first parent folder that contains a "sites" directory. */
export function repoRoot(start = process.cwd()): string {
  let dir = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(dir, "sites")) && fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error(`Could not find repo root (a folder with /sites) from ${start}`);
    dir = parent;
  }
}

export function siteDir(siteId = currentSiteId()) {
  const dir = path.join(repoRoot(), "sites", siteId);
  if (!fs.existsSync(dir)) throw new Error(`Site "${siteId}" not found at ${dir}`);
  return dir;
}

export class ContentError extends Error {}

function readValidated<T>(file: string, schema: z.ZodType<T>): T {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    throw new ContentError(`${rel(file)}: cannot read JSON (${(e as Error).message})`);
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ContentError(`${rel(file)}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

const rel = (file: string) => path.relative(repoRoot(), file);

export function loadSite(siteId = currentSiteId()): Site {
  return readValidated(path.join(siteDir(siteId), "site.json"), siteSchema);
}

export function loadLayout(locale: string, siteId = currentSiteId()): Layout {
  return readValidated(path.join(siteDir(siteId), "content", locale, "layout.json"), layoutSchema);
}

/** Returns null if the page does not exist for that locale. */
export function loadPage(locale: string, slug: string, siteId = currentSiteId()): Page | null {
  const file = path.join(siteDir(siteId), "content", locale, "pages", `${slug || "index"}.json`);
  if (!fs.existsSync(file)) return null;
  return readValidated(file, pageSchema);
}

/** All page slugs for a locale ("" = home). */
export function listSlugs(locale: string, siteId = currentSiteId()): string[] {
  const root = path.join(siteDir(siteId), "content", locale, "pages");
  if (!fs.existsSync(root)) return [];
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".json")) {
        const slug = path.relative(root, full).replace(/\.json$/, "").split(path.sep).join("/");
        out.push(slug === "index" ? "" : slug);
      }
    }
  };
  walk(root);
  return out.sort();
}

/** Every URL to prerender, e.g. ["/", "/en/", "/de/"]. */
export function allPaths(siteId = currentSiteId()): string[] {
  const site = loadSite(siteId);
  const paths = ["/"];
  for (const { code } of site.locales) {
    for (const slug of listSlugs(code, siteId)) paths.push(pagePath(code, slug));
  }
  return paths;
}

/**
 * Full content check: schemas, dialog references, and that every locale has
 * the same pages with the same block structure. Returns a list of problems.
 */
export function validateSite(siteId = currentSiteId()): string[] {
  const problems: string[] = [];
  const attempt = <T>(fn: () => T): T | undefined => {
    try {
      return fn();
    } catch (e) {
      problems.push((e as Error).message);
      return undefined;
    }
  };

  const site = attempt(() => loadSite(siteId));
  if (!site) return problems;

  const codes = site.locales.map((l) => l.code);
  if (!codes.includes(site.defaultLocale)) {
    problems.push(`site.json: defaultLocale "${site.defaultLocale}" is not in locales`);
  }

  const shape = (p: Page) => p.blocks.map((b) => b.type).join(",");
  const reference = new Map<string, string>(); // slug -> block shape in default locale
  const refSlugs = listSlugs(site.defaultLocale, siteId);

  for (const locale of [site.defaultLocale, ...codes.filter((c) => c !== site.defaultLocale)]) {
    const where = `sites/${siteId}/content/${locale}`;
    const layout = attempt(() => loadLayout(locale, siteId));
    const dialogIds = new Set(layout?.dialogs.map((d) => d.id) ?? []);

    const slugs = listSlugs(locale, siteId);
    if (!slugs.includes("")) problems.push(`${where}: missing pages/index.json (home page)`);
    for (const s of refSlugs) if (!slugs.includes(s)) problems.push(`${where}: missing page "${s || "index"}" (exists in ${site.defaultLocale})`);
    for (const s of slugs) if (!refSlugs.includes(s)) problems.push(`${where}: extra page "${s || "index"}" (not in ${site.defaultLocale})`);

    const checkDialogRefs = (file: string, json: unknown) => {
      JSON.stringify(json, (key, value) => {
        if (key === "dialog" && typeof value === "string" && !dialogIds.has(value)) {
          problems.push(`${file}: dialog "${value}" is not defined in layout.json`);
        }
        return value;
      });
    };
    if (layout) checkDialogRefs(`${where}/layout.json`, layout);

    for (const slug of slugs) {
      const page = attempt(() => loadPage(locale, slug, siteId));
      if (!page) continue;
      const file = `${where}/pages/${slug || "index"}.json`;
      checkDialogRefs(file, page);
      if (locale === site.defaultLocale) reference.set(slug, shape(page));
      else if (reference.has(slug) && reference.get(slug) !== shape(page)) {
        problems.push(
          `${file}: block order differs from ${site.defaultLocale}\n  ${site.defaultLocale}: ${reference.get(slug)}\n  ${locale}: ${shape(page)}`,
        );
      }
    }
  }
  return problems;
}

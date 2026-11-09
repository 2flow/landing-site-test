# Landing sites

Static, multilingual landing pages built with **React Router v8 + Vite**,
designed to be maintained by AI agents.

- **Content and code are separate.** Each site is a folder of JSON content per
  language; the code is a shared library of blocks.
- **Fully static output.** Every page is prerendered to HTML at build time and
  can be hosted on any static host or CDN. There's no server, database or admin
  login on the live site.
- **Validated content.** Zod schemas check every content file at build time;
  broken content fails the build, not the live site.

First site: **Moon HQ** (`sites/moon-hq`), in English and German.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173/en/
npm run build      # validate + static build → apps/web/build/client
npm run preview    # serve the build like a static host → http://localhost:4173/
```

Build a different site with `SITE=<folder> npm run build`.

| Command            | What it does                                         |
|--------------------|------------------------------------------------------|
| `npm run validate` | Checks all content: schemas, dialog refs, locale parity |
| `npm run schema`   | Regenerates `schemas/*.schema.json` for editor autocomplete |
| `npm run typecheck`| TypeScript check                                     |

## How it fits together

```
sites/moon-hq/content/en/pages/index.json ─┐
sites/moon-hq/content/de/pages/index.json ─┤   build time (Node)
sites/moon-hq/content/*/layout.json ───────┼─► validate (Zod) ─► React Router prerender
packages/blocks (React components + CSS) ──┘                           │
                                                                       ▼
                                          apps/web/build/client/  (static HTML/CSS/JS)
                                            index.html   → language redirect
                                            en/index.html
                                            de/index.html
```

A page is a list of blocks:

```json
{
  "meta": { "title": "…", "description": "…" },
  "blocks": [
    { "type": "hero", "title": "…", "actions": [{ "label": "Start", "variant": "primary", "dialog": "start" }], "image": { "src": "/images/moon-surface.webp" } },
    { "type": "cards", "id": "features", "title": "…", "items": [{ "title": "…", "text": "…" }] }
  ]
}
```

Content files reference `schemas/*.schema.json`, so VS Code gives you
autocomplete and inline errors while editing.

See **[CLAUDE.md](./CLAUDE.md)** for the full rules (also the instructions AI
agents follow).

## Deploying

Upload `apps/web/build/client/` to any static host (Cloudflare Pages, Netlify,
S3 + CloudFront, nginx…). Settings for a Git-connected host:

- Build command: `npm run build`
- Output directory: `apps/web/build/client`
- Env: `SITE=moon-hq`

`/` redirects to the visitor's language (`/en/` or `/de/`).

## Not done yet

- Forms (sign in, start, demo) are front-end only, the same as in the prototype. To
  make them real, point them at a form endpoint (e.g. a small serverless function).
- `site.json` has no `url` yet. Add the production URL to get absolute canonical
  and `hreflang` links.
- Imprint / privacy pages (required in DE/AT) can be added as normal pages.

# Landing sites — instructions for AI agents

Static marketing sites built from **content (JSON)** + **shared blocks (React)**.
React Router v8 prerenders every page to plain HTML; there is no server at runtime.

## The one rule

**Content changes go in `sites/<site>/content/`. Code changes go in `packages/`.**
Most requests ("change the hero text", "add a FAQ item", "translate to French")
are content-only. Do not touch components for them.

## Layout

```
sites/<site>/
  site.json                 name, url, locales, default locale
  theme.css                 colour + font tokens (CSS variables), font imports
  public/                   images, favicon → served from "/"
  content/<locale>/
    layout.json             nav, footer, dialogs (forms), labels
    pages/index.json        home page   → /<locale>/
    pages/<slug>.json       other pages → /<locale>/<slug>/
packages/blocks/src/
  schemas.ts                ← the content contract (Zod). Source of truth.
  blocks/<name>/            one component + CSS per block
  chrome/                   Nav, Footer, Dialog, ActionButton
  registry.tsx              block type → component
packages/core/src/server.ts build-time loading + validation (Node only)
apps/web/                   React Router app (routes, prerender config)
schemas/*.schema.json       generated from schemas.ts (editor autocomplete)
```

## Blocks available

| type    | what it is                                              |
|---------|---------------------------------------------------------|
| `hero`  | full-height intro, background image, optional app panel |
| `steps` | numbered 1-2-3 steps on a light section (`dunes`/`plain`) |
| `cards` | grid of numbered feature cards                          |
| `split` | two columns (e.g. audiences) with bullets + action      |
| `cta`   | centred closing call-to-action (`horizon`/`plain`)      |

Exact fields: read `packages/blocks/src/schemas.ts`.

**Actions** (buttons/links) everywhere use one shape:
`{ "label": "…", "variant": "primary" | "ghost" (optional), "href" | "dialog" | "toast": "…" }`
— exactly one of `href`, `dialog` (id from layout.json) or `toast` (message).

## Translations

- Every locale has the **same pages with the same block order**. Only text differs.
  `npm run validate` fails otherwise.
- When editing content in one locale, update all other locales in the same change.
- Anchor `id`s (e.g. `"how-it-works"`) and dialog ids stay identical across locales.
- German copy uses informal "du".
- New locale: add it to `site.json`, copy `content/<default>/` to `content/<new>/`, translate.

## Workflow

1. Edit content (or code).
2. `npm run validate` — schema, dialog references and locale parity.
3. `npm run build` — must pass (validate runs first).
4. Optional: `npm run preview` → http://localhost:4173/

When you change `schemas.ts`: update the component, run `npm run schema`,
update every site's content that uses the block, and run validate.

## Adding a new block

1. `packages/blocks/src/blocks/<name>/<Name>.tsx` + `<name>.css`
2. Schema in `schemas.ts` (use `z.strictObject`, add to `blockSchema` union)
3. Register in `registry.tsx`
4. `npm run schema && npm run validate && npm run build`

Prefer a **variant** of an existing block over a new block when the layout is
close. Site-specific one-offs are a smell — ask first.

## Guardrails

- Block CSS uses theme tokens (`var(--c-…)`, `var(--font-…)`), never brand hex values.
  Site colours belong in `sites/<site>/theme.css`.
- `schemas.ts` must not import React; components import it with `import type` only
  (keeps Zod out of the browser bundle).
- `@landing/core/server` uses `fs` — only import it in route `loader`s / scripts.
- No runtime backend, no third-party scripts, no external font CDNs. Forms are
  front-end only (no data is sent) until a form endpoint is added deliberately.
- Keep content strings plain text (no HTML). Use `{field}` placeholders in dialog
  success messages.

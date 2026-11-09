/**
 * Content contract for every block and for the shared site chrome.
 *
 * Content files (sites/<site>/content/<locale>/**.json) are validated against
 * these schemas at build time. If you add a field here, the component must
 * handle it; if you add a block, register it in ./registry.tsx.
 *
 * This file must stay free of React imports so scripts can load it cheaply.
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const text = z.string().min(1);

/** Visual style of a button. Omit for a plain text link. */
export const variantSchema = z.enum(["primary", "ghost"]);

const actionBase = {
  label: text,
  variant: variantSchema.optional(),
};

/**
 * A clickable thing. Exactly one target:
 * - href:   a link ("#features", "/de/", "https://…")
 * - dialog: opens a dialog defined in layout.json by its id
 * - toast:  shows a short message
 */
export const actionSchema = z.union([
  z.strictObject({ ...actionBase, href: text }),
  z.strictObject({ ...actionBase, dialog: text }),
  z.strictObject({ ...actionBase, toast: text }),
]);
export type Action = z.infer<typeof actionSchema>;

export const imageSchema = z.strictObject({
  /** Path under the site's public folder, e.g. "/images/moon-surface.webp" */
  src: z.string().startsWith("/"),
  /** CSS background-position, e.g. "50% 60%" */
  position: z.string().optional(),
});

/** Optional anchor id so nav links like "#features" can target the block. */
const anchor = z
  .string()
  .regex(/^[a-z0-9-]+$/, "use lowercase letters, numbers and dashes")
  .optional();

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

export const heroSchema = z.strictObject({
  type: z.literal("hero"),
  id: anchor,
  eyebrow: text.optional(),
  title: text,
  text: text.optional(),
  actions: z.array(actionSchema).max(3).default([]),
  note: text.optional(),
  image: imageSchema,
  /** Floating product panel on the right of the hero. */
  panel: z
    .strictObject({
      label: text,
      title: text,
      meta: text.optional(),
      tiles: z
        .array(
          z.strictObject({
            status: z.enum(["running", "building"]),
            statusLabel: text,
            name: text,
            url: text,
            sharing: text,
          }),
        )
        .min(1)
        .max(2),
      /** Lines typed out in the little terminal, cycling. */
      terminal: z
        .array(z.strictObject({ command: text, output: text }))
        .min(1),
    })
    .optional(),
});

export const stepsSchema = z.strictObject({
  type: z.literal("steps"),
  id: anchor,
  eyebrow: text.optional(),
  title: text,
  /** "dunes" = light sand-landscape section, "plain" = light flat section */
  background: z.enum(["dunes", "plain"]).default("dunes"),
  items: z.array(z.strictObject({ title: text, text })).min(1).max(6),
});

export const cardsSchema = z.strictObject({
  type: z.literal("cards"),
  id: anchor,
  eyebrow: text.optional(),
  title: text,
  /** Faint textured image on the right side of the section. */
  image: imageSchema.optional(),
  items: z.array(z.strictObject({ title: text, text })).min(1).max(12),
});

export const splitSchema = z.strictObject({
  type: z.literal("split"),
  id: anchor,
  eyebrow: text.optional(),
  title: text,
  columns: z
    .array(
      z.strictObject({
        title: text,
        text,
        bullets: z.array(text).default([]),
        action: actionSchema.optional(),
      }),
    )
    .length(2),
});

export const ctaSchema = z.strictObject({
  type: z.literal("cta"),
  id: anchor,
  title: text,
  text: text.optional(),
  actions: z.array(actionSchema).max(3).default([]),
  /** Show the brand mark above the title. */
  mark: z.boolean().default(true),
  /** "horizon" = stars and a glowing planet edge */
  background: z.enum(["horizon", "plain"]).default("horizon"),
});

export const blockSchema = z.discriminatedUnion("type", [
  heroSchema,
  stepsSchema,
  cardsSchema,
  splitSchema,
  ctaSchema,
]);
export type Block = z.infer<typeof blockSchema>;
export type BlockOf<T extends Block["type"]> = Extract<Block, { type: T }>;

/* ------------------------------------------------------------------ */
/* Site chrome: nav, footer, dialogs (one layout.json per locale)      */
/* ------------------------------------------------------------------ */

export const fieldSchema = z.strictObject({
  name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/),
  label: text,
  type: z.enum(["email", "text", "select"]),
  placeholder: text.optional(),
  autocomplete: text.optional(),
  options: z.array(text).optional(),
  required: z.boolean().default(false),
  errors: z
    .strictObject({
      /** Shown when a required field is empty. */
      required: text.optional(),
      /** Shown when an email address is malformed. */
      invalid: text.optional(),
    })
    .default({}),
});

export const dialogSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: text,
  text: text.optional(),
  /** Buttons shown above the form (e.g. passkey, SSO). */
  actions: z.array(actionSchema).default([]),
  /** Divider text between actions and form, e.g. "or". */
  divider: text.optional(),
  form: z.strictObject({
    fields: z.array(fieldSchema).min(1),
    submit: z.strictObject({ label: text, variant: variantSchema.default("primary") }),
    note: text.optional(),
    /**
     * What happens after a valid submit. Use {email} or any other
     * {fieldName} as a placeholder.
     * NOTE: forms are front-end only for now; nothing is sent anywhere.
     */
    success: z.union([
      z.strictObject({ type: z.literal("toast"), message: text }),
      z.strictObject({
        type: z.literal("done"),
        title: text,
        text,
        button: text,
      }),
    ]),
  }),
});
export type DialogContent = z.infer<typeof dialogSchema>;

export const layoutSchema = z.strictObject({
  $schema: z.string().optional(),
  brand: z.strictObject({
    name: text,
    homeLabel: text,
    backToTopLabel: text,
  }),
  nav: z.strictObject({
    links: z.array(actionSchema).default([]),
    /** Links in the mobile menu. Defaults to `links`. */
    mobileLinks: z.array(actionSchema).optional(),
    actions: z.array(actionSchema).max(3).default([]),
    menuOpenLabel: text,
    menuCloseLabel: text,
  }),
  footer: z.strictObject({
    links: z.array(actionSchema).default([]),
    copyright: text,
    languageLabel: text,
  }),
  closeLabel: text,
  dialogs: z.array(dialogSchema).default([]),
});
export type Layout = z.infer<typeof layoutSchema>;

/* ------------------------------------------------------------------ */
/* Pages and site config                                               */
/* ------------------------------------------------------------------ */

export const pageSchema = z.strictObject({
  $schema: z.string().optional(),
  meta: z.strictObject({
    title: text,
    description: text,
  }),
  blocks: z.array(blockSchema).min(1),
});
export type Page = z.infer<typeof pageSchema>;

export const siteSchema = z.strictObject({
  $schema: z.string().optional(),
  name: text,
  /** Public URL without trailing slash, used for canonical + hreflang. */
  url: z.url().optional(),
  defaultLocale: z.string().min(2),
  locales: z
    .array(z.strictObject({ code: z.string().min(2), label: text }))
    .min(1),
});
export type Site = z.infer<typeof siteSchema>;

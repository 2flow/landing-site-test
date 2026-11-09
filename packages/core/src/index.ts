/** Browser-safe helpers (no fs). */

/** "/en/" for the home page, "/en/pricing/" for slug "pricing". */
export function pagePath(locale: string, slug: string) {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return clean ? `/${locale}/${clean}/` : `/${locale}/`;
}

/** Slug from a URL splat: "" → "", "pricing/" → "pricing". */
export function slugFromSplat(splat: string | undefined) {
  return (splat ?? "").replace(/^\/+|\/+$/g, "");
}

import { data } from "react-router";
import { BlockRenderer, Dialog, Footer, Nav, SiteRuntime, usePageMotion } from "@landing/blocks";
import { loadLayout, loadPage, loadSite, pagePath, slugFromSplat } from "@landing/core/server";
import type { Route } from "./+types/page";

/** Runs at build time only (prerender). The result is baked into the HTML. */
export async function loader({ params }: Route.LoaderArgs) {
  const site = loadSite();
  const locale = params.lang;
  const slug = slugFromSplat(params["*"]);
  if (!site.locales.some((l) => l.code === locale)) throw data(null, { status: 404 });

  const page = loadPage(locale, slug);
  if (!page) throw data(null, { status: 404 });
  const layout = loadLayout(locale);

  return {
    site: { name: site.name, url: site.url ?? null },
    locale,
    path: pagePath(locale, slug),
    locales: site.locales.map((l) => ({
      code: l.code,
      label: l.label,
      href: pagePath(l.code, slug),
      current: l.code === locale,
    })),
    layout,
    page,
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Not found" }];
  const { page, site, locales, path, locale } = loaderData;
  const abs = (p: string) => (site.url ? site.url + p : p);
  return [
    { title: page.meta.title },
    { name: "description", content: page.meta.description },
    { property: "og:title", content: page.meta.title },
    { property: "og:description", content: page.meta.description },
    { property: "og:site_name", content: site.name },
    { property: "og:locale", content: locale },
    { tagName: "link", rel: "canonical", href: abs(path) },
    ...locales.map((l) => ({ tagName: "link", rel: "alternate", hrefLang: l.code, href: abs(l.href) })),
  ];
}

export default function PageRoute({ loaderData }: Route.ComponentProps) {
  const { layout, page, locales } = loaderData;
  usePageMotion();
  return (
    <SiteRuntime>
      <Nav layout={layout} />
      <main id="top">
        <BlockRenderer blocks={page.blocks} />
      </main>
      <Footer layout={layout} locales={locales} />
      {layout.dialogs.map((d) => (
        <Dialog key={d.id} dialog={d} closeLabel={layout.closeLabel} />
      ))}
    </SiteRuntime>
  );
}

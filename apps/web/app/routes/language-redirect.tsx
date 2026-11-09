import { loadSite, pagePath } from "@landing/core/server";
import type { Route } from "./+types/language-redirect";

/**
 * "/" has no content of its own. An inline script sends visitors to the
 * best matching language (browser preference) before the page renders;
 * without JS, a delayed meta refresh goes to the default locale.
 */
export async function loader() {
  const site = loadSite();
  return {
    name: site.name,
    defaultHref: pagePath(site.defaultLocale, ""),
    locales: site.locales.map((l) => ({ code: l.code, label: l.label, href: pagePath(l.code, "") })),
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: loaderData?.name },
    { httpEquiv: "refresh", content: `3; url=${loaderData?.defaultHref}` },
    { name: "robots", content: "noindex" },
  ];
}

export default function LanguageRedirect({ loaderData }: Route.ComponentProps) {
  const { locales, defaultHref } = loaderData;
  const map = Object.fromEntries(locales.map((l) => [l.code, l.href]));
  const script = `(function(){var m=${JSON.stringify(map)},d=${JSON.stringify(defaultHref)};var w=navigator.languages||[navigator.language];for(var i=0;i<w.length;i++){var c=String(w[i]).slice(0,2).toLowerCase();if(m[c]){location.replace(m[c]);return}}location.replace(d)})();`;

  return (
    <main className="wrap" style={{ padding: "160px var(--gutter)" }}>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <ul>
        {locales.map((l) => (
          <li key={l.code}>
            <a href={l.href} hrefLang={l.code}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

import type { Layout } from "../schemas";
import { ActionButton } from "./ActionButton";
import { Mark } from "./Mark";

export type LocaleLink = { code: string; label: string; href: string; current: boolean };

export function Footer({ layout, locales }: { layout: Layout; locales: LocaleLink[] }) {
  const { footer, brand } = layout;
  return (
    <footer className="footer">
      <div className="wrap">
        <a className="brand" href="#top" aria-label={brand.backToTopLabel}>
          <Mark />
          <span className="wordmark">{brand.name}</span>
        </a>
        <nav aria-label="Footer">
          {footer.links.map((a, i) => (
            <ActionButton key={i} action={a} />
          ))}
        </nav>
        <div className="footer-meta">
          {locales.length > 1 && (
            <nav className="lang-switch" aria-label={footer.languageLabel}>
              {locales.map((l) => (
                <a
                  key={l.code}
                  href={l.href}
                  hrefLang={l.code}
                  lang={l.code}
                  aria-current={l.current ? "page" : undefined}
                >
                  {l.label}
                </a>
              ))}
            </nav>
          )}
          <span className="small">{footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
}

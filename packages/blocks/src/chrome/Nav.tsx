import { useEffect, useState } from "react";
import type { Layout } from "../schemas";
import { ActionButton } from "./ActionButton";
import { Mark } from "./Mark";

export function Nav({ layout }: { layout: Layout }) {
  const { nav, brand } = layout;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(-1);

  // frosted bar on scroll + highlight the section currently in view
  useEffect(() => {
    const targets = nav.links.map((l) =>
      "href" in l && l.href.startsWith("#") ? document.querySelector<HTMLElement>(l.href) : null,
    );
    let ticking = false;
    const update = () => {
      ticking = false;
      setScrolled(window.scrollY > 40);
      const y = window.scrollY + window.innerHeight * 0.35;
      let cur = -1;
      targets.forEach((s, i) => {
        if (s && s.offsetTop <= y) cur = i;
      });
      setActive(cur);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [nav.links]);

  const close = () => setOpen(false);
  const mobileLinks = nav.mobileLinks ?? nav.links;

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}${open ? " open" : ""}`}>
      <div className="wrap nav-inner">
        <a className="brand" href="#top" aria-label={brand.homeLabel}>
          <Mark />
          <span className="wordmark">{brand.name}</span>
        </a>
        <ul className="nav-links">
          {nav.links.map((link, i) => (
            <li key={i}>
              {"href" in link ? (
                <a href={link.href} aria-current={i === active ? "true" : undefined}>
                  {link.label}
                </a>
              ) : (
                <ActionButton action={link} />
              )}
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          {nav.actions.map((a, i) => (
            <ActionButton key={i} action={a} />
          ))}
          <button
            type="button"
            className="menu-toggle"
            aria-label={open ? nav.menuCloseLabel : nav.menuOpenLabel}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
          </button>
        </div>
      </div>
      <div className="mobile-menu" id="mobile-menu">
        {mobileLinks.map((a, i) => (
          <ActionButton key={`l${i}`} action={a} onClick={close} />
        ))}
        {nav.actions.map((a, i) => (
          <ActionButton key={`a${i}`} action={a} onClick={close} className={a.variant ? "btn-block" : undefined} />
        ))}
      </div>
    </header>
  );
}

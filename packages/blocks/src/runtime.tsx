import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

/* ------------------------------------------------------------------ */
/* Site runtime: dialogs + toast, shared by every action button        */
/* ------------------------------------------------------------------ */

type Runtime = {
  openDialog: (id: string) => void;
  toast: (message: string) => void;
  registerDialog: (id: string, open: () => void) => () => void;
};

const RuntimeContext = createContext<Runtime | null>(null);

export function useRuntime() {
  const ctx = useContext(RuntimeContext);
  if (!ctx) throw new Error("useRuntime must be used inside <SiteRuntime>");
  return ctx;
}

export function SiteRuntime({ children }: { children: ReactNode }) {
  const dialogs = useRef(new Map<string, () => void>());
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 3200);
  }, []);

  const openDialog = useCallback((id: string) => {
    const open = dialogs.current.get(id);
    if (!open) {
      console.warn(`[blocks] No dialog with id "${id}" in layout.json`);
      return;
    }
    document.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach((d) => d.close());
    open();
  }, []);

  const registerDialog = useCallback((id: string, open: () => void) => {
    dialogs.current.set(id, open);
    return () => {
      dialogs.current.delete(id);
    };
  }, []);

  return (
    <RuntimeContext.Provider value={{ openDialog, toast, registerDialog }}>
      {children}
      <div className={`toast${visible ? " show" : ""}`} role="status" aria-live="polite">
        {message}
      </div>
    </RuntimeContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Motion hooks                                                        */
/* ------------------------------------------------------------------ */

/** Adds `in` once the element is 30% visible (one-shot reveal). */
export function useInView<T extends Element>(ref: RefObject<T | null>, threshold = 0.3) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return inView;
}

/**
 * Page-level motion, ported 1:1 from the prototype:
 * - adds `loaded` to <html> once fonts are ready (hero entrance)
 * - parallax for elements with data-parallax-* attributes
 */
export function usePageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    let cancelled = false;
    const markLoaded = () => {
      if (!cancelled) requestAnimationFrame(() => root.classList.add("loaded"));
    };
    if (document.fonts?.ready) {
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(markLoaded);
    } else {
      markLoaded();
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1101px)");
    const q = <T extends HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s));

    const parallax = () => {
      const heroImgs = q("[data-parallax-hero]");
      const panels = q("[data-parallax-panel]");
      const days = q<HTMLElement>("[data-parallax-day]");
      const layers = q("[data-parallax-section]");
      if (reduce.matches) {
        [...heroImgs, ...panels, ...days, ...layers].forEach((el) => (el.style.transform = ""));
        return;
      }
      const y = window.scrollY;
      const vh = window.innerHeight;
      if (y < vh * 1.5) {
        heroImgs.forEach((el) => (el.style.transform = `translate3d(0,${(y * 0.6).toFixed(1)}px,0)`));
      }
      panels.forEach(
        (el) => (el.style.transform = desktop.matches ? `translate3d(0,${(y * -0.5).toFixed(1)}px,0)` : ""),
      );
      days.forEach((el) => {
        const r = (el.parentNode as HTMLElement).getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) el.style.transform = `translate3d(0,${(r.top * -0.08).toFixed(1)}px,0)`;
      });
      layers.forEach((el) => {
        const r = (el.parentNode as HTMLElement).getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const k = parseFloat(el.dataset.parallaxSection ?? "0");
          el.style.transform = `translate3d(0,${((r.top - vh / 2) * k).toFixed(1)}px,0)`;
        }
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        parallax();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduce.addEventListener?.("change", onScroll);
    onScroll();
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduce.removeEventListener?.("change", onScroll);
    };
  }, []);
}

import { useEffect, useRef, useState } from "react";
import type { BlockOf } from "../../schemas";
import { ActionButton } from "../../chrome/ActionButton";
import "./hero.css";

type Props = { block: BlockOf<"hero">; index: number };

export function Hero({ block, index }: Props) {
  const titleId = `b${index}-title`;
  return (
    <section className="hero" id={block.id} aria-labelledby={titleId}>
      <div className="hero-bg grain" aria-hidden="true">
        <div
          className="hero-img"
          data-parallax-hero
          style={{
            backgroundImage: `url("${block.image.src}")`,
            backgroundPosition: block.image.position ?? "50% 60%",
          }}
        />
      </div>
      <div className="wrap">
        <div className="hero-copy">
          {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
          <h1 className="h-display" id={titleId}>
            {block.title}
          </h1>
          {block.text && <p className="body-l">{block.text}</p>}
          {block.actions.length > 0 && (
            <div className="hero-ctas">
              {block.actions.map((a, i) => (
                <ActionButton key={i} action={a} />
              ))}
            </div>
          )}
          {block.note && <p className="small">{block.note}</p>}
        </div>
        {block.panel && <Panel panel={block.panel} />}
      </div>
    </section>
  );
}

function Panel({ panel }: { panel: NonNullable<Props["block"]["panel"]> }) {
  return (
    <div className="panel" data-parallax-panel aria-label={panel.label}>
      <div className="panel-head">
        <span className="h-title">{panel.title}</span>
        {panel.meta && <span className="small">{panel.meta}</span>}
      </div>
      <div className="tiles">
        {panel.tiles.map((t, i) => (
          <div className="tile" key={i}>
            <span className={`pill${t.status === "building" ? " building" : ""}`}>{t.statusLabel}</span>
            <p className="tile-name">{t.name}</p>
            <span className="tile-url">{t.url}</span>
            <span className="tile-share">{t.sharing}</span>
          </div>
        ))}
      </div>
      <Terminal lines={panel.terminal} />
    </div>
  );
}

/** Types each command, reveals its output, then cycles. Static if reduced motion. */
function Terminal({ lines }: { lines: { command: string; output: string }[] }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState<string | null>(null); // null = static first line
  const [showOut, setShowOut] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
    let k = 0;
    const play = () => {
      const line = lines[k % lines.length];
      setStep(k % lines.length);
      setTyped("");
      setShowOut(false);
      let i = 0;
      const tick = () => {
        i++;
        setTyped(line.command.slice(0, i));
        if (i < line.command.length) later(tick, 55);
        else {
          later(() => setShowOut(true), 450);
          later(() => {
            k++;
            play();
          }, 5200);
        }
      };
      later(tick, 55);
    };
    later(play, 1500);
    const all = timers.current;
    return () => all.forEach(clearTimeout);
  }, [lines]);

  const line = lines[step];
  return (
    <div className="deploy" aria-hidden="true">
      <div className="cmd">
        &gt; {typed ?? line.command}
        <span className="caret" />
      </div>
      <div className={`out${showOut ? "" : " hide"}`}>{line.output}</div>
    </div>
  );
}

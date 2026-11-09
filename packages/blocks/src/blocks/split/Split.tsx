import { Fragment, useRef } from "react";
import type { BlockOf } from "../../schemas";
import { ActionButton } from "../../chrome/ActionButton";
import { useInView } from "../../runtime";
import "./split.css";

export function Split({ block, index }: { block: BlockOf<"split">; index: number }) {
  const titleId = `b${index}-title`;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <section className="aud grain" id={block.id} aria-labelledby={titleId}>
      <div className="aud-glow" aria-hidden="true" />
      <div className="wrap">
        {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
        <h2 className="h-section" id={titleId}>
          {block.title}
        </h2>
        <div ref={ref} className={`split${inView ? " in" : ""}`}>
          {block.columns.map((col, i) => (
            <Fragment key={i}>
              {i > 0 && <div className="divider" aria-hidden="true" />}
              <div className="path">
                <h3>{col.title}</h3>
                <p>{col.text}</p>
                {col.bullets.length > 0 && (
                  <ul>
                    {col.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
                {col.action && <ActionButton action={col.action} />}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

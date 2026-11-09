import { useRef } from "react";
import type { BlockOf } from "../../schemas";
import { ActionButton } from "../../chrome/ActionButton";
import { Mark } from "../../chrome/Mark";
import { useInView } from "../../runtime";
import "./cta.css";

export function Cta({ block, index }: { block: BlockOf<"cta">; index: number }) {
  const titleId = `b${index}-title`;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);

  return (
    <section
      ref={ref}
      className={`final final-${block.background} grain${inView ? " in" : ""}`}
      id={block.id}
      aria-labelledby={titleId}
    >
      {block.background === "horizon" && (
        <>
          <div className="stars" aria-hidden="true" />
          <div className="planet" data-parallax-section="-0.08" aria-hidden="true" />
        </>
      )}
      <div className="wrap">
        {block.mark && <Mark className="mark reveal-mark" />}
        <h2 className="h-display" id={titleId}>
          {block.title}
        </h2>
        {block.text && <p className="body-l">{block.text}</p>}
        {block.actions.length > 0 && (
          <div className="final-ctas">
            {block.actions.map((a, i) => (
              <ActionButton key={i} action={a} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import type { BlockOf } from "../../schemas";
import "./cards.css";

export function Cards({ block, index }: { block: BlockOf<"cards">; index: number }) {
  const titleId = `b${index}-title`;
  return (
    <section className="features grain" id={block.id} aria-labelledby={titleId}>
      <div className="features-glow" aria-hidden="true" />
      {block.image && (
        <div
          className="features-surface"
          data-parallax-section="0.12"
          aria-hidden="true"
          style={{
            backgroundImage: `url("${block.image.src}")`,
            backgroundPosition: block.image.position ?? "78% 85%",
          }}
        />
      )}
      <div className="wrap">
        {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
        <h2 className="h-section" id={titleId}>
          {block.title}
        </h2>
        <div className="cards">
          {block.items.map((item, i) => (
            <article className="card" key={i}>
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="h-title">{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

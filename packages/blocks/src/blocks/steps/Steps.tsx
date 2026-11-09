import { useRef } from "react";
import type { BlockOf } from "../../schemas";
import { useInView } from "../../runtime";
import "./steps.css";

export function Steps({ block, index }: { block: BlockOf<"steps">; index: number }) {
  const titleId = `b${index}-title`;
  const listRef = useRef<HTMLOListElement>(null);
  const inView = useInView(listRef);

  return (
    <section className={`day day-${block.background}`} id={block.id} aria-labelledby={titleId}>
      {block.background === "dunes" && <Dunes />}
      <div className="wrap">
        {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
        <h2 className="h-section" id={titleId}>
          {block.title}
        </h2>
        <ol ref={listRef} className={`steps${inView ? " in" : ""}`}>
          {block.items.map((item, i) => (
            <li className="step" key={i}>
              <span className="step-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="step-line" />
              <h3 className="h-title">{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Soft sand-dune landscape behind the section. */
function Dunes() {
  return (
    <div className="day-bg" aria-hidden="true">
      <svg viewBox="0 0 1440 520" preserveAspectRatio="none" data-parallax-day="">
        <defs>
          <linearGradient id="dunes-sand1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E6D5C9" />
            <stop offset=".6" stopColor="#F1E6DE" />
            <stop offset="1" stopColor="#E2D0C3" />
          </linearGradient>
          <linearGradient id="dunes-sand2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3EAE4" />
            <stop offset="1" stopColor="#E9DBD0" />
          </linearGradient>
          <filter id="dunes-soft">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <pattern
            id="dunes-ripple"
            width="60"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-8)"
          >
            <path d="M0 7 Q15 3 30 7 T60 7" fill="none" stroke="#C9B3A5" strokeOpacity=".35" strokeWidth="1" />
          </pattern>
        </defs>
        <path
          d="M0 330 C 260 300, 520 250, 820 180 C 1040 130, 1250 90, 1440 70 L1440 520 L0 520Z"
          fill="url(#dunes-sand1)"
          filter="url(#dunes-soft)"
        />
        <path
          d="M0 330 C 260 300, 520 250, 820 180 C 1040 130, 1250 90, 1440 70 L1440 520 L0 520Z"
          fill="url(#dunes-ripple)"
          opacity=".7"
        />
        <path
          d="M0 430 C 300 400, 700 360, 1100 330 C 1260 318, 1360 316, 1440 316 L1440 520 L0 520Z"
          fill="url(#dunes-sand2)"
          opacity=".85"
        />
        <path
          d="M0 430 C 300 400, 700 360, 1100 330 C 1260 318, 1360 316, 1440 316 L1440 520 L0 520Z"
          fill="url(#dunes-ripple)"
          opacity=".45"
        />
      </svg>
    </div>
  );
}

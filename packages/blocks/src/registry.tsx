import type { ComponentType } from "react";
import type { Block } from "./schemas";
import { Hero } from "./blocks/hero/Hero";
import { Steps } from "./blocks/steps/Steps";
import { Cards } from "./blocks/cards/Cards";
import { Split } from "./blocks/split/Split";
import { Cta } from "./blocks/cta/Cta";

type BlockComponent<T extends Block["type"]> = ComponentType<{
  block: Extract<Block, { type: T }>;
  index: number;
}>;

/** Maps a content `type` to its component. Add new blocks here + in schemas.ts. */
export const registry: { [T in Block["type"]]: BlockComponent<T> } = {
  hero: Hero,
  steps: Steps,
  cards: Cards,
  split: Split,
  cta: Cta,
};

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        const Component = registry[block.type] as BlockComponent<typeof block.type>;
        return <Component key={i} block={block as never} index={i} />;
      })}
    </>
  );
}

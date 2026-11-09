import "./styles/base.css";
import "./chrome/chrome.css";

// Types only: schema values live in "@landing/blocks/schemas" so Zod never
// ends up in the browser bundle (validation happens at build time).
export type { Action, Block, BlockOf, DialogContent, Layout, Page, Site } from "./schemas";
export { BlockRenderer, registry } from "./registry";
export { SiteRuntime, usePageMotion, useInView, useRuntime } from "./runtime";
export { Nav } from "./chrome/Nav";
export { Footer, type LocaleLink } from "./chrome/Footer";
export { Dialog } from "./chrome/Dialog";
export { ActionButton } from "./chrome/ActionButton";
export { Mark } from "./chrome/Mark";

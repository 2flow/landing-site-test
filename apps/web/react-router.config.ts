import type { Config } from "@react-router/dev/config";
import { allPaths } from "@landing/core/server";

export default {
  // Fully static: no server at runtime. Every page is rendered to HTML at
  // build time from the site's content files.
  ssr: false,
  prerender: async () => allPaths(),
} satisfies Config;

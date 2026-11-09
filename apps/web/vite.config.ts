import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { currentSiteId, siteDir } from "@landing/core/server";

const site = currentSiteId();
const dir = siteDir(site);

export default defineConfig({
  // static assets (images, favicon, robots.txt) come from the site folder
  publicDir: path.join(dir, "public"),
  resolve: {
    alias: { "@site": dir },
  },
  server: {
    fs: { allow: [path.resolve(dir, "../..")] },
  },
  plugins: [reactRouter()],
});

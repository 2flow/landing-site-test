import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  // "/" → sends visitors to their language (/en/, /de/, …)
  index("routes/language-redirect.tsx"),
  // "/:lang/" and "/:lang/any/page/" → content/<lang>/pages/<slug>.json
  route(":lang/*", "routes/page.tsx"),
] satisfies RouteConfig;

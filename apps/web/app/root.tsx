import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useParams } from "react-router";
import type { Route } from "./+types/root";
import "@landing/blocks/styles.css";
import "@site/theme.css";

/*
 * Runs before first paint: enables the entrance animations (`.js`), and
 * guarantees content becomes visible even if the app script fails to load.
 */
const bootScript = `document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.add('loaded')},2500);`;

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang } = useParams();
  return (
    <html lang={lang ?? "en"} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="wrap" style={{ padding: "160px var(--gutter)" }}>
      <h1 className="h-section">{notFound ? "Page not found" : "Something went wrong"}</h1>
      <p className="body-l">
        <a href="/">Go to the home page</a>
      </p>
    </main>
  );
}

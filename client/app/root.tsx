import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { AuthBackground } from "./components/AuthBackground";
import { LOGO_URL } from "./lib/brand";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: LOGO_URL, type: "image/svg+xml" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <AuthBackground headline="Right at your fingertips">
        <div className="auth-card relative z-10 w-full max-w-md text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-oppex-primary">
            404
          </p>
          <h1 className="mt-2 text-3xl font-bold text-oppex-heading">
            Page not found
          </h1>
          <p className="mt-3 text-sm text-oppex-muted">
            The requested page could not be found.
          </p>
          <a href="/login" className="btn-primary mt-6 inline-flex w-auto px-6">
            Back to login
          </a>
        </div>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <div className="auth-card relative z-10 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-oppex-heading">Something went wrong</h1>
        <p className="mt-2 text-sm text-oppex-muted">
          {isRouteErrorResponse(error)
            ? error.statusText
            : error instanceof Error
              ? error.message
              : "An unexpected error occurred."}
        </p>
      </div>
    </AuthBackground>
  );
}

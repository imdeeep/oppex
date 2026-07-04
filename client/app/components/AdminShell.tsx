import type { ReactNode } from "react";
import { Link } from "react-router";
import { AuthBackground } from "./AuthBackground";
import { Logo } from "./Logo";

const TABS = ["Incidents", "Services", "Policies", "Schedules", "Users"];

type AdminShellProps = {
  email: string;
  children: ReactNode;
  onLogout: () => void;
  loggingOut?: boolean;
};

export function AdminShell({
  email,
  children,
  onLogout,
  loggingOut = false,
}: AdminShellProps) {
  return (
    <div className="min-h-dvh bg-[#f9fafb] text-oppex-heading">
      <header className="border-b border-white/10 bg-oppex-nav text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Logo className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-white/70 sm:inline">{email}</span>
            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="cursor-pointer rounded-lg border border-white/20 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3">
          {TABS.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                index === 0
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

export function ErrorShell({
  code,
  title,
  message,
  actionLabel,
  actionTo,
}: {
  code: string;
  title: string;
  message: string;
  actionLabel: string;
  actionTo: string;
}) {
  return (
    <AuthBackground headline="Right at your fingertips">
      <div className="auth-card relative z-10 w-full max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-oppex-primary">
          {code}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-oppex-heading">{title}</h1>
        <p className="mt-3 text-sm text-oppex-muted">{message}</p>
        <Link
          to={actionTo}
          className="btn-primary mt-6 inline-flex w-auto px-6"
        >
          {actionLabel}
        </Link>
      </div>
    </AuthBackground>
  );
}

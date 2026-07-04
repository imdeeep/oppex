import type { ReactNode } from "react";

type AuthBackgroundProps = {
  headline?: string;
  children: ReactNode;
};

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <div className="auth-bg-shell">
      <div className="auth-bg-base" aria-hidden="true" />
      <div className="auth-bg-glow-primary" aria-hidden="true" />
      <div className="auth-bg-glow-secondary" aria-hidden="true" />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}

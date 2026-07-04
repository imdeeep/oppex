import type { ReactNode } from "react";
import { AuthBackground } from "./AuthBackground";
import { Logo } from "./Logo";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <AuthBackground >
      <div className="w-full max-w-md">
        <div className="auth-logo-glow mb-6">
          <Logo className="relative z-10 h-9 w-auto" />
        </div>

        <div className="auth-card">
          <h1 className="text-2xl font-bold text-oppex-heading">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-oppex-muted">{subtitle}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </AuthBackground>
  );
}

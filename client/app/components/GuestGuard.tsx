import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { getMe } from "../lib/api";

type GuestGuardProps = {
  children: React.ReactNode;
};

export function GuestGuard({ children }: GuestGuardProps) {
  const [status, setStatus] = useState<"loading" | "guest" | "authed">("loading");

  useEffect(() => {
    let active = true;

    getMe()
      .then(() => {
        if (active) {
          setStatus("authed");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("guest");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0b0218] text-sm text-white/80">
        Loading...
      </div>
    );
  }

  if (status === "authed") {
    return <Navigate to="/portal" replace />;
  }

  return children;
}

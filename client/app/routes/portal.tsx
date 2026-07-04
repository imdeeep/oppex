import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AdminShell } from "../components/AdminShell";
import { ApiError, getMe, logout } from "../lib/api";

export function meta() {
  return [{ title: "Portal | Oppex" }];
}

export default function PortalPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    getMe()
      .then((user) => {
        if (active) {
          setEmail(user.email);
        }
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          navigate("/unauthorized");
          return;
        }
        navigate("/login");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  }

  if (loading || !email) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f9fafb] text-oppex-heading">
        Loading portal...
      </div>
    );
  }

  return (
    <AdminShell email={email} onLogout={handleLogout} loggingOut={loggingOut}>
      <section className="rounded-2xl border-2 border-oppex-primary/30 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-oppex-heading">
          Welcome to the Oppex
        </h1>
        <p className="mt-2 text-sm text-oppex-muted">
          Your email is validated. You can access the portal.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { label: "Open incidents", value: "12" },
          { label: "Active services", value: "8" },
          { label: "On-call schedules", value: "3" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-oppex-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-oppex-heading">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-oppex-heading">
            Recent incidents
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            ["Payments API latency", "High", "Investigating"],
            ["Login alert noise", "Medium", "Monitoring"],
            ["Database failover test", "Low", "Resolved"],
          ].map(([title, severity, status]) => (
            <div
              key={title}
              className="grid gap-2 px-5 py-4 text-sm md:grid-cols-3"
            >
              <span className="font-medium text-oppex-heading">{title}</span>
              <span className="text-oppex-muted">{severity}</span>
              <span className="text-oppex-primary">{status}</span>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

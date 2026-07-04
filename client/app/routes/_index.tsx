import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { getMe } from "../lib/api";

export function meta() {
  return [{ title: "Oppex" }];
}

export default function IndexPage() {
  const [status, setStatus] = useState<"loading" | "login" | "portal">("loading");

  useEffect(() => {
    let active = true;

    getMe()
      .then(() => {
        if (active) {
          setStatus("portal");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("login");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return null;
  }

  if (status === "portal") {
    return <Navigate to="/portal" replace />;
  }

  return <Navigate to="/login" replace />;
}

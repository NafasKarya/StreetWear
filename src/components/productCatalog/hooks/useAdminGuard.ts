// src/components/product/hooks/useAdminGuard.ts
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/logic/authLocal";

const getAdminAccessToken = (): string => {
  try {
    const fromAuthLocal =
      (typeof window !== "undefined" && (getCurrentUser() as any)?.admin_access_token) || "";
    if (fromAuthLocal) return fromAuthLocal;
    const fromLS =
      typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
    return fromLS || "";
  } catch {
    return "";
  }
};

export default function useAdminGuard() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch("/api/auth/admin/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (!cancelled && me.ok) {
          const data = await me.json();
          if (data?.role === "admin") {
            setIsAdmin(true);
            return;
          }
        }
      } catch {}
      try {
        const token = getAdminAccessToken();
        if (!token) {
          if (!cancelled) setIsAdmin(false);
          return;
        }
        const fc = await fetch("/api/admin/feature-check", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
          cache: "no-store",
        });
        if (!cancelled) setIsAdmin(fc.ok);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return isAdmin;
}

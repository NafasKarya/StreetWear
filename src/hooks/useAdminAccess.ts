"use client";

import { ensureAdminAccessToken } from "@/lib/auth/adminFetch";
import { getAdminAccessToken } from "@/lib/auth/adminToken";
import { useEffect, useState } from "react";


export function useAdminAccess() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      await ensureAdminAccessToken();
      if (!alive) return;
      setToken(getAdminAccessToken());
      setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  return { ready, token };
}

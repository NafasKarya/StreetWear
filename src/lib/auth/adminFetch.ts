import { getAdminAccessToken, isAccessTokenNearExpiry, setAdminAccessToken, clearAdminAccessToken } from "./adminToken";

// panggil endpoint refresh → rely on HttpOnly cookies (admin_session + admin_refresh) yang sudah diset waktu login
async function refreshAccessToken() {
  const res = await fetch("/api/auth/admin/token/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return false;
  const data = await res.json();
  if (!data?.ok || !data.admin_access_token) return false;
  setAdminAccessToken(data.admin_access_token, data.accessExpiresAt, data.refreshExpiresAt);
  return true;
}

// init saat load halaman baru / reload tab
export async function ensureAdminAccessToken() {
  // kalau belum ada token atau sudah mau expired → refresh
  if (!getAdminAccessToken() || isAccessTokenNearExpiry()) {
    await refreshAccessToken();
  }
}

export type AdminFetchInit = RequestInit & {
  // kalau true, otomatis coba refresh + retry sekali saat 401
  autoRetryOn401?: boolean;
  // override: pakai header "x-admin-access-token" bukan Authorization
  headerMode?: "authorization" | "x-admin";
};

export async function adminFetch(input: string, init: AdminFetchInit = {}) {
  const { autoRetryOn401 = true, headerMode = "authorization", ...rest } = init;

  // pastikan token ada (atau refresh dulu)
  await ensureAdminAccessToken();

  const token = getAdminAccessToken();

  const headers = new Headers(rest.headers || {});
  if (token) {
    if (headerMode === "authorization") {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.set("x-admin-access-token", token);
    }
  }

  const res = await fetch(input, {
    ...rest,
    headers,
    credentials: "include", // cookie session & refresh ikut
  });

  if (res.status !== 401 || !autoRetryOn401) {
    return res;
  }

  // 401 → coba refresh lalu retry sekali
  const ok = await refreshAccessToken();
  if (!ok) {
    clearAdminAccessToken();
    return res; // biarkan 401 mengalir
  }

  const token2 = getAdminAccessToken();
  const headers2 = new Headers(rest.headers || {});
  if (token2) {
    if (headerMode === "authorization") {
      headers2.set("Authorization", `Bearer ${token2}`);
    } else {
      headers2.set("x-admin-access-token", token2);
    }
  }

  return fetch(input, {
    ...rest,
    headers: headers2,
    credentials: "include",
  });
}

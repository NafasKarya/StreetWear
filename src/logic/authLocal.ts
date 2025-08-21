// authLocal.ts — hybrid: user via API, admin via API, (opsional) local fallback

export type User = {
  username?: string;
  email: string;
  password?: string;
  role: "admin" | "user";
};

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function saveUsers(users: User[]) {
  if (!isBrowser()) return;
  localStorage.setItem("users", JSON.stringify(users));
}
function getUsers(): User[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem("users");
  return raw ? JSON.parse(raw) : [];
}

function setCurrentUser(u: User | null) {
  if (!isBrowser()) return;
  if (u) localStorage.setItem("currentUser", JSON.stringify(u));
  else localStorage.removeItem("currentUser");
}
export function getCurrentUserLocal(): User | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem("currentUser");
  return raw ? (JSON.parse(raw) as User) : null;
}

const ADMIN_TOKEN_KEY = "admin_access_token";
const USER_TOKEN_KEY  = "user_access_token";           // ⭐ NEW

// --- Helpers HTTP
async function parse(res: Response) {
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

// Admin token helpers
function setAdminToken(tok?: string) {
  if (!isBrowser()) return;
  if (tok) sessionStorage.setItem(ADMIN_TOKEN_KEY, tok);
}
function clearAdminToken() {
  if (!isBrowser()) return;
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}
function getAdminToken() {
  if (!isBrowser()) return null;
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}
async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const tok = getAdminToken();
  if (tok && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${tok}`);
  return fetch(input, { ...init, headers, credentials: "include" });
}

// ⭐ NEW: User token helpers
function setUserToken(tok?: string) {
  if (!isBrowser()) return;
  if (tok) sessionStorage.setItem(USER_TOKEN_KEY, tok);
}
function clearUserToken() {
  if (!isBrowser()) return;
  sessionStorage.removeItem(USER_TOKEN_KEY);
}
function getUserToken() {
  if (!isBrowser()) return null;
  return sessionStorage.getItem(USER_TOKEN_KEY);
}
async function fetchWithUserAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const tok = getUserToken();
  if (tok && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${tok}`);
  return fetch(input, { ...init, headers, credentials: "include" });
}

// ====================== USER (register via API) ======================
export async function register(
  username: string,
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; msg: string }> {
  try {
    const res = await fetch("/api/auth/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({} as any));

    if (!res.ok) {
      return { ok: false, msg: data?.message || "Register gagal" };
    }

    // sukses — anggap user langsung login lokal (tanpa password)
    setCurrentUser({ username, email: data?.email ?? email, role: "user" });
    return { ok: true };
  } catch {
    return { ok: false, msg: "Network error. Coba lagi." };
  }
}

// ====================== LOGIN (user via API, fallback admin via API, fallback local) ======================
export async function login(
  credential: string,
  password: string,
  forceAdmin = false
): Promise<{ ok: true; user: User } | { ok: false; msg: string }> {

  // 1) Jika TIDAK dipaksa admin → coba USER API dulu
  if (!forceAdmin) {
    try {
      const email = credential.includes("@") ? credential : credential + "";
      const { res, data } = await parse(
        await fetch("/api/auth/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        })
      );

      if (res.ok) {
        // simpan user token + current user
        const tok = data?.user_access_token as string | undefined;
        if (tok) setUserToken(tok);
        clearAdminToken(); // pastikan gak nyangkut token admin
        const user: User = { email: data?.email ?? email, role: "user" };
        setCurrentUser(user);
        return { ok: true, user };
      }
      // kalau 401, lanjut coba admin di bawah
    } catch {
      // abaikan; lanjut coba admin/local
    }
  }

  // 2) Coba ADMIN via API
  try {
    const email = credential.includes("@") ? credential : credential + "";
    const { res, data } = await parse(
      await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })
    );

    if (res.ok) {
      const tok = data?.admin_access_token as string | undefined;
      if (tok) setAdminToken(tok);
      clearUserToken(); // pastikan gak nyangkut token user
      const adminUser: User = { email: data?.email ?? email, role: "admin" };
      setCurrentUser(adminUser);
      return { ok: true, user: adminUser };
    }
  } catch {
    // lanjut fallback lokal
  }

  // 3) Opsional: fallback ke user lokal (kalau masih dipakai)
  const localUsers = getUsers();
  const local = localUsers.find(
    (u) =>
      (u.username === credential || u.email === credential) &&
      u.password === password &&
      u.role === "user"
  );
  if (local && !forceAdmin) {
    setCurrentUser(local);
    clearAdminToken();
    clearUserToken();
    return { ok: true, user: local };
  }

  return { ok: false, msg: "Login gagal" };
}

// ====================== LOGOUT ======================
export async function logout(): Promise<void> {
  const u = getCurrentUserLocal();
  setCurrentUser(null);

  if (u?.role === "admin") {
    clearAdminToken();
    try {
      await fetchWithAuth("/api/auth/admin/logout", { method: "POST", credentials: "include" });
    } catch { /* diam */ }
  } else if (u?.role === "user") {
    clearUserToken(); // hapus bearer
    // kalau kamu punya route /api/auth/user/logout, panggil di sini:
    try {
      await fetchWithUserAuth("/api/auth/user/logout", { method: "POST", credentials: "include" });
    } catch { /* diam */ }
  }
}

// ====================== CURRENT USER ======================
export async function getCurrentUser(): Promise<User | null> {
  const u = getCurrentUserLocal();
  if (!u) return null;

  if (u.role === "admin") {
    try {
      const { res, data } = await parse(await fetchWithAuth("/api/auth/admin/me", { credentials: "include" }));
      if (!res.ok) {
        clearAdminToken();
        setCurrentUser(null);
        return null;
      }
      return { email: data?.email ?? u.email, role: "admin" };
    } catch {
      return u;
    }
  }

  // ⭐ NEW: verifikasi user ke /api/auth/user/me
  if (u.role === "user") {
    try {
      const { res, data } = await parse(await fetchWithUserAuth("/api/auth/user/me", { credentials: "include" }));
      if (!res.ok) {
        clearUserToken();
        setCurrentUser(null);
        return null;
      }
      return { email: data?.email ?? u.email, role: "user" };
    } catch {
      return u;
    }
  }

  return u;
}

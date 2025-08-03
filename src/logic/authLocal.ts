// authLocal.ts (TypeScript, Next.js compatible, hanya admin hardcode)
export type User = {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user";
};

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// Inject admin (HANYA ADMIN, user biasa harus register manual)
function ensureAdminUser() {
  if (!isBrowser()) return;
  let users: User[] = [];
  const raw = localStorage.getItem("users");
  if (raw) {
    users = JSON.parse(raw);
  }
  const hasAdmin = users.some(
    (u) => u.email === "admin@dev.com" && u.role === "admin"
  );
  if (!hasAdmin) {
    users.push({
      username: "admin",
      email: "admin@dev.com",
      password: "admin123",
      role: "admin",
    });
    localStorage.setItem("users", JSON.stringify(users));
  }
}

// Call on every import/use
if (isBrowser()) ensureAdminUser();

function saveUsers(users: User[]) {
  if (!isBrowser()) return;
  localStorage.setItem("users", JSON.stringify(users));
}

function getUsers(): User[] {
  if (!isBrowser()) return [];
  ensureAdminUser(); // Always make sure admin exists!
  const raw = localStorage.getItem("users");
  return raw ? JSON.parse(raw) : [];
}

export function register(
  username: string,
  email: string,
  password: string
): { ok: true } | { ok: false; msg: string } {
  const users = getUsers();
  if (users.some((u) => u.username === username))
    return { ok: false, msg: "Username sudah terdaftar" };
  if (users.some((u) => u.email === email))
    return { ok: false, msg: "Email sudah terdaftar" };
  const user: User = { username, email, password, role: "user" };
  users.push(user);
  saveUsers(users);
  if (isBrowser()) localStorage.setItem("currentUser", JSON.stringify(user)); // auto-login
  return { ok: true };
}

export function login(
  credential: string,
  password: string
): { ok: true; user: User } | { ok: false; msg: string } {
  const users = getUsers();
  const user = users.find(
    (u) =>
      (u.username === credential || u.email === credential) &&
      u.password === password
  );
  if (!user)
    return { ok: false, msg: "Username/email atau password salah" };
  if (isBrowser()) localStorage.setItem("currentUser", JSON.stringify(user));
  return { ok: true, user };
}

export function logout() {
  if (!isBrowser()) return;
  localStorage.removeItem("currentUser");
}

export function getCurrentUser(): User | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}

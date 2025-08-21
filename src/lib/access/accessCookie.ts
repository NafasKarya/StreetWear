// src/lib/access/accessCookie.ts
import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

export const ACCESS_COOKIE = "product_access";
const DEFAULT_TTL_SEC = 60 * 60 * 24 * 7; // 7 hari

function signKey() {
  const s = process.env.ACCESS_SIGN_SECRET || process.env.JWT_SIGN_SECRET || "";
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("ACCESS_SIGN_SECRET wajib di-set di env (atau pakai JWT_SIGN_SECRET)");
  }
  return new TextEncoder().encode(s || "dev-sign-secret-change-me");
}

function b64u(buf: Buffer) { return buf.toString("base64url"); }
function hmac(bytes: Buffer) {
  return crypto.createHmac("sha256", signKey()).update(bytes).digest();
}

export type AccessPayload = {
  ver: 1;
  exp: number;      // unix seconds
  scopes: string[];
};

type WriteAccessOpts = {
  ttlSec?: number;           // default 7 hari
  hardExp?: Date | null;     // hormati expires dari DB kalau ada
  sessionOnly?: boolean;     // ❗ tambahkan ini
  path?: string;             // default "/"
};

export async function writeAccessCookie(
  scopes: string[],
  ttlSec?: number,
  hardExp?: Date | null,
  opts?: WriteAccessOpts
) {
  const store = await cookies();
  const now = Math.floor(Date.now() / 1000);
  const _ttl = opts?.ttlSec ?? ttlSec ?? DEFAULT_TTL_SEC;

  const exp = opts?.sessionOnly
    ? now + _ttl  // tetap taruh di payload (untuk validasi server)
    : (hardExp
        ? Math.min(now + _ttl, Math.floor(hardExp.getTime() / 1000))
        : now + _ttl);

  const payload: AccessPayload = { ver: 1, exp, scopes: Array.from(new Set(scopes)) };
  const payloadB = Buffer.from(JSON.stringify(payload));
  const sig = hmac(payloadB);
  const value = `${b64u(payloadB)}.${b64u(sig)}`;

  const cookieInit: Parameters<typeof store.set>[0] = {
    name: ACCESS_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: opts?.path ?? "/",
  };

  // ❗ session-only: JANGAN set maxAge/expires → jadi session cookie
  if (!opts?.sessionOnly) {
    (cookieInit as any).maxAge = exp - now;
  }

  await store.set(cookieInit);
}

export async function readAccessScopesFromRequest(): Promise<string[]> {
  const store = await cookies();
  const raw = store.get(ACCESS_COOKIE)?.value;
  if (!raw) return [];
  const [p64, s64] = raw.split(".");
  if (!p64 || !s64) return [];
  try {
    const payloadB = Buffer.from(p64, "base64url");
    const want = hmac(payloadB);
    const got = Buffer.from(s64, "base64url");
    if (!crypto.timingSafeEqual(want, got)) return [];

    const payload = JSON.parse(payloadB.toString("utf8")) as AccessPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!payload || payload.ver !== 1 || !Array.isArray(payload.scopes) || payload.exp < now) {
      return [];
    }
    return payload.scopes;
  } catch {
    return [];
  }
}

export async function clearAccessCookie() {
  const store = await cookies();
  await store.delete(ACCESS_COOKIE);
}

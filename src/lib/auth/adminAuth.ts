// lib/auth/adminAuth.ts
import "server-only";
import { SignJWT, jwtVerify, type JWTPayload, CompactEncrypt, compactDecrypt } from "jose";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

export type AdminJwt = JWTPayload & { sub: string; role: "admin"; typ?: "admin" };

// Nama cookie session dan refresh
export const ADMIN_COOKIE = "admin_session";
export const ADMIN_REFRESH_COOKIE = "admin_refresh"; // ✅ Tambahan untuk fix error

const DEFAULT_TTL_SEC = 60 * 60 * 24 * 7; // 7 hari

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

// ====== kunci tanda tangan (JWS: HS256) ======
function signKey() {
  const s = process.env.JWT_SIGN_SECRET || process.env.JWT_SECRET || "";
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SIGN_SECRET wajib di-set di env");
    }
    console.warn("[WARN] JWT_SIGN_SECRET kosong — pakai dev key (jangan di production)");
    return new TextEncoder().encode("dev-sign-secret-change-me-please-please");
  }
  return new TextEncoder().encode(s);
}

// ====== kunci enkripsi (JWE: dir + A256GCM) ======
function encKey() {
  // 32 byte key base64url
  const b64 = process.env.JWT_ENC_KEY_B64 || "";
  if (!b64) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_ENC_KEY_B64 wajib di-set (base64url 32-byte)");
    }
    console.warn("[WARN] JWT_ENC_KEY_B64 kosong — pakai dev key (jangan di production)");
    return new TextEncoder().encode("0123456789abcdef0123456789abcdef"); // 32 bytes ascii
  }
  const raw = Buffer.from(b64, "base64url");
  if (raw.length !== 32) throw new Error("JWT_ENC_KEY_B64 invalid: length harus 32 byte");
  return raw;
}

/**
 * SIGN (JWS HS256) -> lalu ENCRYPT (JWE dir+A256GCM)
 * Output: compact JWE (string) untuk dipakai di cookie.
 */
export async function signAdminJwt(email: string, ttlSec = DEFAULT_TTL_SEC) {
  const now = Math.floor(Date.now() / 1000);

  // 1) Buat JWS
  const jws = await new SignJWT({ role: "admin", typ: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSec)
    .sign(signKey());

  // 2) Bungkus JWS jadi JWE
  const jwe = await new CompactEncrypt(new TextEncoder().encode(jws))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWT" })
    .encrypt(encKey());

  return { token: jwe, maxAge: ttlSec } as const;
}

/**
 * VERIFY:
 * - Decrypt JWE -> dapat JWS string
 * - Verify JWS HS256 -> dapat payload
 */
export async function verifyAdminJwt(token: string) {
  try {
    const { plaintext } = await compactDecrypt(token, encKey());
    const jws = new TextDecoder().decode(plaintext);

    const { payload } = await jwtVerify<AdminJwt>(jws, signKey(), { algorithms: ["HS256"] });
    if (payload.role !== "admin" || !payload.sub) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readAdminFromRequest(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value ?? null;
  if (!token) return null;
  return verifyAdminJwt(token);
}

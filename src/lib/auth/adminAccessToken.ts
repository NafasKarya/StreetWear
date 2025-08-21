// src/lib/auth/adminAccessToken.ts
import "server-only";
import crypto from "crypto";
import { EncryptJWT, jwtDecrypt, SignJWT, jwtVerify, JWTPayload } from "jose";

/**
 * HYBRID ACCESS TOKEN:
 * - Inner: JWE (A256GCM, 'dir' = symmetric key)
 * - Outer: JWS (HS256)
 * - Yang disimpan di DB tetap: HASH dari token OUTER (plaintext token TIDAK disimpan)
 *
 * ENV WAJIB:
 * - JWS_SIGN_SECRET  : secret HMAC (>=32 chars)
 * - JWE_ENC_KEY_B64  : 32-byte key Base64URL untuk A256GCM (contoh generate di bawah)
 *
 * Cara generate key:
 * node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
 */

const BYTES_RANDOM = 32; // buat jti fallback
const DEFAULT_TTL_SEC = 10 * 60 * 60; // 10 jam, keep sama perilaku lama

function signKey() {
  const s = process.env.JWS_SIGN_SECRET || "";
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWS_SIGN_SECRET wajib di-set di env");
    } else {
      console.warn("[WARN] JWS_SIGN_SECRET kosong, pakai nilai dev");
      return new TextEncoder().encode("dev-sign-secret-change-me-please-please");
    }
  }
  return new TextEncoder().encode(s);
}

function encKey() {
  const b64 = process.env.JWE_ENC_KEY_B64 || "";
  if (!b64) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWE_ENC_KEY_B64 wajib di-set di env (base64url 32 byte)");
    } else {
      console.warn("[WARN] JWE_ENC_KEY_B64 kosong, pakai dev key");
      return new TextEncoder().encode("0123456789abcdef0123456789abcdef"); // 32 bytes ascii
    }
  }
  try {
    const raw = Buffer.from(b64, "base64url");
    if (raw.length !== 32) throw new Error("length != 32");
    return raw;
  } catch {
    throw new Error("JWE_ENC_KEY_B64 invalid. Harus base64url 32 byte.");
  }
}

export type AdminAccessClaims = JWTPayload & {
  typ: "admin_access";
  uid: number;       // userId
  sub: string;       // email (lowercase)
  scope?: string;    // optional: e.g., "super"
  jti: string;
};

// Tipe input eksplisit (hindari JWTPayload index signature bikin uid jadi unknown)
type AdminAccessInput = {
  uid: number;
  sub: string;
  scope?: string;
  ttlSec?: number;
};

/**
 * Hash token buat disimpan di DB (outer JWS string).
 * NOTE: tetap sama seperti versi lama, supaya kompatibel.
 */
export function hashAccessToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate HYBRID access token (JWS( JWE(payload) )) + TTL default 10 jam.
 * Return plaintext token (outer JWS). Kamu tetap simpan HASH-nya di DB.
 */
export async function generateAccessToken(claims: AdminAccessInput): Promise<string> {
  const ttlSec = claims.ttlSec ?? DEFAULT_TTL_SEC;
  const now = Math.floor(Date.now() / 1000);
  const jti = crypto.randomUUID?.() ?? crypto.randomBytes(BYTES_RANDOM).toString("base64url");

  const innerPayload: AdminAccessClaims = {
    typ: "admin_access",
    uid: claims.uid,
    sub: claims.sub,
    scope: claims.scope,
    jti,
    iat: now,
    exp: now + ttlSec,
  };

  // 1) JWE (inner, terenkripsi)
  const innerJwe = await new EncryptJWT(innerPayload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSec)
    .encrypt(encKey());

  // 2) JWS (outer, ditandatangani)
  const outerJws = await new SignJWT({ jwe: innerJwe })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSec)
    .sign(signKey());

  return outerJws;
}

/**
 * Verifikasi HYBRID token:
 * - Verify JWS HS256
 * - Ambil field `jwe` dari payload outer
 * - Decrypt JWE → dapat inner payload (claims)
 * - `exp`/`iat` dicek otomatis oleh jose saat verify/decrypt
 * Return: inner claims atau null jika invalid.
 */
export async function verifyAccessToken(token: string): Promise<AdminAccessClaims | null> {
  try {
    const { payload: outer } = await jwtVerify<{ jwe: string }>(token, signKey(), {
      algorithms: ["HS256"], // <-- ini valid utk JWS
    });
    if (!outer?.jwe || typeof outer.jwe !== "string") return null;

    // HAPUS opsi 'algorithms' di sini
    const { payload: inner, protectedHeader } = await jwtDecrypt<AdminAccessClaims>(outer.jwe, encKey());

    // Optional: harden cek header JWE
    if (protectedHeader.alg !== "dir" || protectedHeader.enc !== "A256GCM") {
      return null;
    }

    if (inner?.typ !== "admin_access" || typeof inner?.uid !== "number" || !inner?.sub) {
      return null;
    }
    return inner;
  } catch {
    return null;
  }
}

export function safeEqualHex(a: string, b: string): boolean {
  // cepat nolak kalau panjang beda / ganjil (hex harus genap)
  if (a.length !== b.length || (a.length & 1)) return false;
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    // kalau ada char non-hex, hasil buffer bisa lebih pendek → tolak
    if (ba.length !== bb.length || ba.length !== a.length / 2) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

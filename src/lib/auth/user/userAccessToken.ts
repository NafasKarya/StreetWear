import "server-only";
import crypto from "crypto";
import { EncryptJWT, jwtDecrypt, SignJWT, jwtVerify, JWTPayload } from "jose";

/**
 * HYBRID USER ACCESS TOKEN
 * - Inner: JWE (dir + A256GCM)
 * - Outer: JWS (HS256)
 * - Yang disimpan di DB: HASH dari outer JWS (plaintext token TIDAK disimpan)
 *
 * ENV wajib:
 * - JWS_SIGN_SECRET   : secret HMAC (>=32 chars)
 * - JWE_ENC_KEY_B64   : base64url 32-byte key untuk A256GCM
 */

const BYTES_RANDOM = 32;
const DEFAULT_TTL_SEC = 10 * 60 * 60; // 10 jam

function signKey() {
  const s = process.env.JWS_SIGN_SECRET || "";
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWS_SIGN_SECRET wajib di-set di env");
    }
    console.warn("[WARN] JWS_SIGN_SECRET kosong, pakai nilai dev");
    return new TextEncoder().encode("dev-sign-secret-change-me-please-please");
  }
  return new TextEncoder().encode(s);
}

function encKey() {
  const b64 = process.env.JWE_ENC_KEY_B64 || "";
  if (!b64) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWE_ENC_KEY_B64 wajib di-set di env (base64url 32 byte)");
    }
    console.warn("[WARN] JWE_ENC_KEY_B64 kosong, pakai dev key");
    return new TextEncoder().encode("0123456789abcdef0123456789abcdef"); // 32 bytes ascii
  }
  const raw = Buffer.from(b64, "base64url");
  if (raw.length !== 32) throw new Error("JWE_ENC_KEY_B64 invalid. Harus base64url 32 byte.");
  return raw;
}

export type UserAccessClaims = JWTPayload & {
  typ: "user_access";
  uid: number;    // userId
  sub: string;    // email lowercase
  jti: string;
};

type UserAccessInput = {
  uid: number;
  sub: string;
  ttlSec?: number;
};

/** SHA-256 hash untuk disimpan di DB (opsional dipakai kalau kamu mau) */
export function hashUserAccessToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Generate outer JWS yang berisi inner JWE payload (typ: "user_access") */
export async function generateUserAccessToken(claims: UserAccessInput): Promise<string> {
  const ttlSec = claims.ttlSec ?? DEFAULT_TTL_SEC;
  const now = Math.floor(Date.now() / 1000);
  const jti = crypto.randomUUID?.() ?? crypto.randomBytes(BYTES_RANDOM).toString("base64url");

  const innerPayload: UserAccessClaims = {
    typ: "user_access",
    uid: claims.uid,
    sub: claims.sub,
    jti,
    iat: now,
    exp: now + ttlSec,
  };

  // 1) Inner JWE
  const innerJwe = await new EncryptJWT(innerPayload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSec)
    .encrypt(encKey());

  // 2) Outer JWS
  const outerJws = await new SignJWT({ jwe: innerJwe })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSec)
    .sign(signKey());

  return outerJws;
}

/** Verify user access token → balikin inner claims atau null */
export async function verifyUserAccessToken(token: string): Promise<UserAccessClaims | null> {
  try {
    // Verify outer JWS
    const { payload: outer } = await jwtVerify<{ jwe: string }>(token, signKey(), {
      algorithms: ["HS256"],
    });
    if (!outer?.jwe || typeof outer.jwe !== "string") return null;

    // Decrypt inner JWE (NOTE: jangan pakai opsi 'algorithms' di jwtDecrypt pada jose v5)
    const { payload: inner, protectedHeader } = await jwtDecrypt<UserAccessClaims>(outer.jwe, encKey());

    // Hardening: pastikan header sesuai ekspektasi
    if (protectedHeader.alg !== "dir" || protectedHeader.enc !== "A256GCM") return null;

    if (inner?.typ !== "user_access" || typeof inner?.uid !== "number" || !inner?.sub) {
      return null;
    }
    return inner;
  } catch {
    return null;
  }
}

import "server-only";
import { SignJWT, jwtVerify, type JWTPayload, CompactEncrypt, compactDecrypt } from "jose";
import type { NextRequest } from "next/server";

export type UserJwt = JWTPayload & { sub: string; role: "user"; typ?: "user" };

export const USER_COOKIE = "user_session";
export const USER_REFRESH_COOKIE = "user_refresh";
const DEFAULT_TTL_SEC = 60 * 60 * 24 * 7; // 7 hari

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

/** SIGN (JWS HS256) -> ENCRYPT (JWE dir+A256GCM) */
export async function signUserJwt(email: string, ttlSec = DEFAULT_TTL_SEC) {
  const now = Math.floor(Date.now() / 1000);

  // 1) JWS
  const jws = await new SignJWT({ role: "user", typ: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSec)
    .sign(signKey());

  // 2) JWE
  const jwe = await new CompactEncrypt(new TextEncoder().encode(jws))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWT" })
    .encrypt(encKey());

  return { token: jwe, maxAge: ttlSec } as const;
}

/** VERIFY: decrypt JWE -> verify JWS -> payload */
export async function verifyUserJwt(token: string) {
  try {
    const { plaintext } = await compactDecrypt(token, encKey());
    const jws = new TextDecoder().decode(plaintext);
    const { payload } = await jwtVerify<UserJwt>(jws, signKey(), { algorithms: ["HS256"] });
    if (payload.role !== "user" || !payload.sub) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(USER_COOKIE)?.value ?? null;
  if (!token) return null;
  return verifyUserJwt(token);
}

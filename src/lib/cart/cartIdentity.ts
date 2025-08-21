// src/lib/cart/cartIdentity.ts
import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { readUserFromRequest } from "@/lib/auth/user/userAuth";

export type CartIdentity =
  | { kind: "user"; userId: number; email: string }
  | { kind: "anon"; anonId: string };

const COOKIE_NAME = "cart_anonymous_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 tahun

export type CartIdentityResult = {
  identity: CartIdentity;
  // kalau anonId baru dibuat, util bakal ngasih flag supaya route bisa set cookie via NextResponse
  needSetAnonCookie?: { name: string; value: string };
};

/**
 * Resolve identitas cart dari request:
 * - Kalau token user valid → return { kind: "user", userId, email }
 * - Kalau tidak → pakai anon cookie. Jika belum ada, generate baru dan kembalikan flag untuk set cookie di response.
 *
 * CATATAN:
 * - Di lingkungan ini `cookies()` bertipe Promise<ReadonlyRequestCookies> → WAJIB `await`.
 * - ReadonlyRequestCookies TIDAK punya `.set`. Set cookie harus dilakukan di Route Handler via NextResponse.
 */
export async function resolveCartIdentity(req: NextRequest): Promise<CartIdentityResult> {
  // 1) Coba baca user dari token
  const payload = await readUserFromRequest(req); // null kalau tidak valid
  if (payload?.sub && payload.role === "user") {
    const uidMaybe = (payload as any).uid;
    if (typeof uidMaybe === "number" && Number.isFinite(uidMaybe)) {
      return {
        identity: { kind: "user", userId: uidMaybe, email: String(payload.sub).toLowerCase() },
      };
    }
    // Kalau belum ada uid di token → biarkan route yang resolve ke DB, di sini jatuhkan ke anon.
  }

  // 2) Fallback anon cookie (readonly di sini → hanya baca)
  const store = await cookies(); // ⬅️ wajib await
  let anon = store.get(COOKIE_NAME)?.value;

  if (!anon) {
    anon = randomUUID();
    // TIDAK bisa set cookie di sini (ReadonlyRequestCookies).
    // Kasih sinyal ke caller supaya set di NextResponse.
    return {
      identity: { kind: "anon", anonId: anon },
      needSetAnonCookie: { name: COOKIE_NAME, value: anon },
    };
  }

  return { identity: { kind: "anon", anonId: anon } };
}

/**
 * Helper untuk dipanggil di Route Handler setelah panggil resolveCartIdentity():
 *
 *   const res = NextResponse.json(...);
 *   applyAnonCookie(res, anonIdBaru);
 *   return res;
 */
export function applyAnonCookie(res: NextResponse, anonId: string) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: anonId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

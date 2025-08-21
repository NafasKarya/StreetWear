// app/api/auth/admin/login/route.ts
import "server-only";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { userRepo } from "@/repositories/userRepo";
import { ADMIN_COOKIE, ADMIN_REFRESH_COOKIE, signAdminJwt, verifyPassword } from "@/lib/auth/adminAuth";
import { generateAccessToken } from "@/lib/auth/adminAccessToken";

export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  const { email, password } = (await req.json()) ?? {};
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: "Email & password wajib" }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await userRepo.findByEmail(normalizedEmail);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // 1) Session cookie (JWT) untuk auth dasar admin
  const jwt = await signAdminJwt(user.email);

  // 2) Issue ACCESS TOKEN HYBRID (JWS+JWE) — 10 jam
  const accessPlain = await generateAccessToken({
    uid: user.id,            // number
    sub: normalizedEmail,    // email lowercase
    scope: "super",          // optional
    ttlSec: 10 * 60 * 60,    // 10 jam
  });
  const { expiresAt: accessExpiresAt } =
    await userRepo.upsertAdminAccessToken(user.id, accessPlain);

  // 3) Issue REFRESH TOKEN (opaque random) — 30 hari, disimpan sebagai HttpOnly cookie
  const refreshPlain = crypto.randomBytes(48).toString("base64url");
  const { expiresAt: refreshExpiresAt } =
    await userRepo.upsertAdminRefreshToken(user.id, refreshPlain);

  const res = NextResponse.json({
    ok: true,
    role: "admin",
    email: user.email,
    admin_access_token: accessPlain,
    accessExpiresAt,
    refreshExpiresAt,
  });

  // set cookie session (JWT)
  res.cookies.set(ADMIN_COOKIE, jwt.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: jwt.maxAge,
  });

  // set cookie refresh (opaque)
  const refreshMaxAge = Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000);
  res.cookies.set(ADMIN_REFRESH_COOKIE, refreshPlain, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api", // sempitkan scope kalau mau
    maxAge: refreshMaxAge,
  });

  return res;
};

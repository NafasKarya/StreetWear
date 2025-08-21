// app/api/auth/user/login/route.ts
export const runtime = "nodejs";

import "server-only";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { userRepo } from "@/repositories/userRepo";
import { verifyPassword } from "@/lib/auth/adminAuth"; // reuse util yang sudah ada
import { signUserJwt, USER_COOKIE, USER_REFRESH_COOKIE } from "@/lib/auth/user/userAuth";
import { generateUserAccessToken } from "@/lib/auth/user/userAccessToken";

export const POST = async (req: NextRequest) => {
  const { email, password } = (await req.json()) ?? {};
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: "Email & password wajib" }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await userRepo.findByEmail(normalizedEmail);
  if (!user || user.role !== "user") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // 1) Session cookie (JWT) untuk auth dasar user
  const jwt = await signUserJwt(user.email);

  // 2) Issue USER ACCESS TOKEN HYBRID (JWS+JWE) — 10 jam
  const accessPlain = await generateUserAccessToken({
    uid: user.id,            // number
    sub: normalizedEmail,    // email lowercase
    ttlSec: 10 * 60 * 60,    // 10 jam
  });
  const { expiresAt: accessExpiresAt } =
    await userRepo.upsertUserAccessToken(user.id, accessPlain);

  // 3) Issue USER REFRESH TOKEN (opaque random) — 30 hari, HttpOnly cookie
  const refreshPlain = crypto.randomBytes(48).toString("base64url");
  const { expiresAt: refreshExpiresAt } =
    await userRepo.upsertUserRefreshToken(user.id, refreshPlain);

  const res = NextResponse.json({
    ok: true,
    role: "user",
    email: user.email,
    user_access_token: accessPlain,
    accessExpiresAt,
    refreshExpiresAt,
  });

  // set cookie session (JWT)
  res.cookies.set(USER_COOKIE, jwt.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: jwt.maxAge,
  });

  // set cookie refresh (opaque)
  const refreshMaxAge = Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000);
  res.cookies.set(USER_REFRESH_COOKIE, refreshPlain, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api",
    maxAge: refreshMaxAge,
  });

  return res;
};

// app/api/auth/admin/token/refresh/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { userRepo } from "@/repositories/userRepo";
import { generateAccessToken } from "@/lib/auth/adminAccessToken";
import { ADMIN_REFRESH_COOKIE } from "@/lib/auth/adminCookies";
import { requireAdmin } from "@/middlewares/requireAdmin";

export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx; // session invalid

  // 1) Ambil refresh token lama dari cookie
  const oldRefresh = req.cookies.get(ADMIN_REFRESH_COOKIE)?.value ?? "";
  if (!oldRefresh) {
    return NextResponse.json(
      { ok: false, message: "No refresh token" },
      { status: 401 }
    );
  }

  // 2) Buat refresh token baru (opaque random)
  const newRefresh = crypto.randomBytes(48).toString("base64url");
  const rotated = await userRepo.rotateAdminRefreshToken(
    ctx.userId,
    oldRefresh,
    newRefresh
  );
  if (!rotated.ok) {
    return NextResponse.json(
      { ok: false, message: "Refresh invalid, please login" },
      { status: 401 }
    );
  }

  // 3) Buat access token baru (hybrid JWS+JWE, 10 jam)
  const newAccess = await generateAccessToken({
    uid: ctx.userId,
    sub: ctx.email.toLowerCase(),
    scope: "super",
    ttlSec: 10 * 60 * 60, // 10 jam
  });
  const { expiresAt: accessExpiresAt } = await userRepo.upsertAdminAccessToken(
    ctx.userId,
    newAccess
  );

  // 4) Kirim response
  const res = NextResponse.json({
    ok: true,
    admin_access_token: newAccess,
    accessExpiresAt,
    refreshExpiresAt: rotated.expiresAt,
  });

  // 5) Set refresh cookie baru (hasil rotasi)
  const refreshMaxAge = Math.floor(
    (rotated.expiresAt.getTime() - Date.now()) / 1000
  );
  res.cookies.set(ADMIN_REFRESH_COOKIE, newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api",
    maxAge: refreshMaxAge,
  });

  return res;
};

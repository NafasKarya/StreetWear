import "server-only";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { userRepo } from "@/repositories/userRepo";
import { generateUserAccessToken } from "@/lib/auth/user/userAccessToken";
import { USER_REFRESH_COOKIE } from "@/lib/auth/user/userAuth";
import { requireUser } from "@/middlewares/requireUser";

export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  const ctx = await requireUser(req);
  if (ctx instanceof NextResponse) return ctx; // session invalid

  // 1) Ambil refresh token lama dari cookie
  const oldRefresh = req.cookies.get(USER_REFRESH_COOKIE)?.value ?? "";
  if (!oldRefresh) {
    return NextResponse.json(
      { ok: false, message: "No refresh token" },
      { status: 401 }
    );
  }

  // 2) Buat refresh token baru (opaque random) + rotate di DB
  const newRefresh = crypto.randomBytes(48).toString("base64url");
  const rotated = await userRepo.rotateUserRefreshToken(
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
  const newAccess = await generateUserAccessToken({
    uid: ctx.userId,
    sub: ctx.email.toLowerCase(),
    ttlSec: 10 * 60 * 60, // 10 jam
  });
  const { expiresAt: accessExpiresAt } = await userRepo.upsertUserAccessToken(
    ctx.userId,
    newAccess
  );

  // 4) Response
  const res = NextResponse.json({
    ok: true,
    user_access_token: newAccess,
    accessExpiresAt,
    refreshExpiresAt: rotated.expiresAt,
  });

  // 5) Set refresh cookie baru
  const refreshMaxAge = Math.floor(
    (rotated.expiresAt.getTime() - Date.now()) / 1000
  );
  res.cookies.set(USER_REFRESH_COOKIE, newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api",
    maxAge: refreshMaxAge,
  });

  return res;
};

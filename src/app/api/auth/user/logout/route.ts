export const runtime = "nodejs";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/middlewares/requireUser";
import { userRepo } from "@/repositories/userRepo";
import { USER_COOKIE, USER_REFRESH_COOKIE } from "@/lib/auth/user/userAuth";

export const POST = async (req: NextRequest) => {
  // pastikan user_session valid
  const ctx = await requireUser(req);
  if (ctx instanceof NextResponse) return ctx; // 401 kalau invalid

  // revoke refresh token user di DB (biar gak bisa dipakai lagi)
  await userRepo.revokeUserRefreshToken(ctx.userId, new Date());

  // clear cookies
  const res = NextResponse.json({ ok: true });
  // hapus sesi (JWT JWE)
  res.cookies.set(USER_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  // hapus refresh (opaque)
  res.cookies.set(USER_REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api",
    maxAge: 0,
  });

  return res;
};

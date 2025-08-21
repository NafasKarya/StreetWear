export const runtime = "nodejs";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/middlewares/requireUser";
import { userRepo } from "@/repositories/userRepo";

export const GET = async (req: NextRequest) => {
  // validasi sesi user dari cookie `user_session`
  const ctx = await requireUser(req);
  if (ctx instanceof NextResponse) return ctx; // otomatis 401 kalau nggak valid

  // ambil profil + meta token (kalau ada)
  const [user, accessMeta, refreshMeta] = await Promise.all([
    userRepo.findByEmail(ctx.email),
    userRepo.getUserAccessTokenMeta(ctx.userId),
    userRepo.getUserRefreshTokenMeta(ctx.userId),
  ]);

  if (!user || user.role !== "user") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    role: "user",
    id: user.id,
    email: user.email,
    accessExpiresAt: accessMeta?.expiresAt ?? null,
    refreshExpiresAt: refreshMeta?.expiresAt ?? null,
  });
};

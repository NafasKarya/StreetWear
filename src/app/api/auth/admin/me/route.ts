export const runtime = "nodejs";
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/middlewares/requireUser";
import { requireAdmin } from "@/middlewares/requireAdmin";
import { userRepo } from "@/repositories/userRepo";

export const GET = async (req: NextRequest) => {
  // coba user dulu
  const u = await requireUser(req);
  if (!(u instanceof NextResponse)) {
    const [user, accessMeta, refreshMeta] = await Promise.all([
      userRepo.findByEmail(u.email),
      userRepo.getUserAccessTokenMeta(u.userId),
      userRepo.getUserRefreshTokenMeta(u.userId),
    ]);
    return NextResponse.json({
      ok: true, role: "user", id: user!.id, email: user!.email,
      accessExpiresAt: accessMeta?.expiresAt ?? null,
      refreshExpiresAt: refreshMeta?.expiresAt ?? null,
    });
  }

  // kalau bukan user, coba admin
  const a = await requireAdmin(req);
  if (!(a instanceof NextResponse)) {
    const [user, accessMeta, refreshMeta] = await Promise.all([
      userRepo.findByEmail(a.email),
      userRepo.getAdminAccessTokenMeta(a.userId),
      userRepo.getAdminRefreshTokenMeta(a.userId),
    ]);
    return NextResponse.json({
      ok: true, role: "admin", id: user!.id, email: user!.email,
      accessExpiresAt: accessMeta?.expiresAt ?? null,
      refreshExpiresAt: refreshMeta?.expiresAt ?? null,
    });
  }

  return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
};

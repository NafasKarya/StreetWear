// /lib/auth/requireAdminFeature.ts
import { NextRequest, NextResponse } from "next/server";
import { safeEqualHex, hashAccessToken } from "@/lib/auth/adminAccessToken";
import { requireAdmin } from "@/middlewares/requireAdmin";
import { userRepo } from "@/repositories/userRepo";

// Require: cookie admin + header access token yang valid & belum expired
export async function requireAdminFeature(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx; // gagal cookie admin

  const header = req.headers.get("x-admin-access-token") || req.headers.get("authorization");
  const presented = header?.startsWith("Bearer ") ? header.slice(7) : (header ?? "");
  if (!presented) {
    return NextResponse.json({ ok: false, message: "Access token kosong" }, { status: 401 });
  }

  const meta = await userRepo.getAdminAccessTokenMeta(ctx.userId);
  if (!meta) {
    return NextResponse.json({ ok: false, message: "Access token tidak ditemukan" }, { status: 401 });
  }
  if (new Date() > meta.expiresAt) {
    return NextResponse.json({ ok: false, message: "Access token kadaluarsa" }, { status: 401 });
  }

  const valid = safeEqualHex(hashAccessToken(presented), meta.tokenHash);
  if (!valid) {
    return NextResponse.json({ ok: false, message: "Access token salah" }, { status: 401 });
  }

  return ctx; // { email, userId }
}

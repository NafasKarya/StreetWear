// src/lib/auth/requireAdmin.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { readAdminFromRequest } from "@/lib/auth/adminAuth";
import { userRepo } from "@/repositories/userRepo";

/**
 * Return:
 *  - NextResponse 401 kalau gagal
 *  - { email, userId } kalau lolos
 */
export async function requireAdmin(
  req: NextRequest
): Promise<NextResponse | { email: string; userId: number }> {
  // baca cookie -> decrypt -> verify (sesuai adminAuth barumu)
  const payload = await readAdminFromRequest(req);
  if (!payload?.sub) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // pastikan user admin di DB
  const email = String(payload.sub).trim().toLowerCase();
  const user = await userRepo.findByEmail(email);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  return { email: user.email, userId: user.id };
}

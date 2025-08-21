import { readAdminFromRequest } from "@/lib/auth/adminAuth";
import { NextRequest, NextResponse } from "next/server";
import { userRepo } from "@/repositories/userRepo";

type AdminContext = { email: string; userId: number };

// Pakai di SEMUA route khusus admin (kecuali route "create first admin")
export async function requireAdmin(
  req: NextRequest
): Promise<AdminContext | NextResponse> {
  const payload = await readAdminFromRequest(req);

  // payload null/invalid → 401
  if (!payload || ((payload as any).typ && (payload as any).typ !== "admin")) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const emailRaw = String(payload.sub ?? "");
  const email = emailRaw.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // Ambil user + pastikan role admin
  const user = await userRepo.findByEmail(email);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // ✅ sekarang return email + userId (number)
  return { email: user.email, userId: user.id };
}

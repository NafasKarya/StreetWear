// src/middlewares/requireUser.ts

import { NextRequest, NextResponse } from "next/server";
import { userRepo } from "@/repositories/userRepo";
import { readUserFromRequest } from "@/lib/auth/user/userAuth";

type UserContext = { email: string; userId: number };

// Pakai di semua route khusus user login
export async function requireUser(
  req: NextRequest
): Promise<UserContext | NextResponse> {
  const payload = await readUserFromRequest(req);

  // payload null/invalid → 401
  if (!payload || ((payload as any).typ && (payload as any).typ !== "user")) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const emailRaw = String(payload.sub ?? "");
  const email = emailRaw.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // Ambil user + pastikan role "user"
  const user = await userRepo.findByEmail(email);
  if (!user || user.role !== "user") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  // ✅ lolos
  return { email: user.email, userId: user.id };
}

import { readUserFromRequest } from "@/lib/auth/user/userAuth";
import { NextRequest, NextResponse } from "next/server";
import { userRepo } from "@/repositories/userRepo";

type UserContext = { email: string; userId: number };

export async function requireUser(
  req: NextRequest
): Promise<UserContext | NextResponse> {
  const payload = await readUserFromRequest(req);

  if (!payload || ((payload as any).typ && (payload as any).typ !== "user")) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const email = String(payload.sub ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const user = await userRepo.findByEmail(email);
  if (!user || user.role !== "user") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  return { email: user.email, userId: user.id };
}

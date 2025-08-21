// src/app/api/admin/feature-check/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx; // 401
  return NextResponse.json({ ok: true, userId: ctx.userId, email: ctx.email });
}

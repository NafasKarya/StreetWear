// src/app/api/access/clear/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextResponse } from "next/server";
import { clearAccessCookie } from "@/lib/access/accessCookie";

export async function POST() {
  try {
    await clearAccessCookie();
    return NextResponse.json({ ok: true, note: "Akses dibersihkan." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Gagal hapus akses" }, { status: 500 });
  }
}

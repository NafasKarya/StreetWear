export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { accessCodeRepo } from "@/repositories/accessCodeRepo";
import { generateAccessToken, sha256Hex } from "@/lib/access/accessCode";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 Next 15: promise
) {
  const { id: idStr } = await params;            // 👈 await params
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, message: "ID invalid" }, { status: 400 });
  }

  try {
    const existing = await accessCodeRepo.getById(id);
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    }

    const plaintext = generateAccessToken();
    const tokenHash = sha256Hex(plaintext);

    await accessCodeRepo.rotateToken(id, tokenHash);

    return NextResponse.json({
      ok: true,
      data: { id, updatedAt: new Date() },
      access_token_plaintext: plaintext,
      note: "Token berhasil di-rotate. Simpan sekarang ya.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Gagal rotate token" }, { status: 500 });
  }
}

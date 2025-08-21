// src/app/api/access/claim/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sha256Hex } from "@/lib/access/accessCode";
import { writeAccessCookie } from "@/lib/access/accessCookie";

const Body = z.object({
  code: z.string().min(8), // plaintext yang diketik user
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Kode invalid" }, { status: 400 });
  }

  const tokenHash = sha256Hex(parsed.data.code);

  // Cari access code by hash
  const ac = await prisma.accessCode.findUnique({ where: { tokenHash } });
  if (!ac || !ac.enabled || ac.deletedAt) {
    return NextResponse.json({ ok: false, message: "Kode tidak ditemukan / dinonaktifkan" }, { status: 404 });
  }

  const now = new Date();
  if (ac.expiresAt && ac.expiresAt <= now) {
    return NextResponse.json({ ok: false, message: "Kode sudah kedaluwarsa" }, { status: 400 });
  }
  if (ac.maxUses != null && ac.usedCount >= ac.maxUses) {
    return NextResponse.json({ ok: false, message: "Kode sudah mencapai batas pemakaian" }, { status: 400 });
  }

  // Increment usedCount secara aman
  await prisma.accessCode.update({
    where: { id: ac.id },
    data: { usedCount: { increment: 1 } },
  });

  // Tulis cookie berisi scope dari kode tsb (pakai helper BARU kamu)
  // - scopes: array
  // - ttlSec: biarkan default helper (7 hari) atau set manual
  // - hardExp: hormati expires dari DB (jika ada)
  // - opts: atur path agar hanya dipakai endpoint tertentu (mis. /api/user)
  await writeAccessCookie(
    [ac.scope],
    undefined,                  // pakai default 7 hari dari helper
    ac.expiresAt ?? null,       // hormati expiry dari DB bila ada
    { path: "/api/user" }       // batasi cakupan cookie
    // kalau mau session-only: tambahkan sessionOnly: true
    // { path: "/api/user", sessionOnly: true }
  );

  return NextResponse.json({
    ok: true,
    scope: ac.scope,
    note: "Akses diberikan. Silakan reload halaman produk.",
  });
}

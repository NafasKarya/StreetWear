// src/app/api/access-codes/verify/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { accessCodeRepo } from "@/repositories/accessCodeRepo";
import { sha256Hex } from "@/lib/access/accessCode";
import { writeAccessCookie, clearAccessCookie } from "@/lib/access/accessCookie";
import { userAccessRepo } from "@/repositories/userAccessRepo";
import { requireUser } from "@/middlewares/requireUser"; // pastikan path ini benar di project-mu

// ✅ definisikan Body
const Body = z.object({
  code: z.string().min(16, "Kode terlalu pendek"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    // aman: validasi dulu
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Body invalid", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const code = parsed.data.code;
    const tokenHash = sha256Hex(code);

    // verify + consume
    const verified = await accessCodeRepo.verifyAndConsume(tokenHash);
    if (!verified) {
      return NextResponse.json(
        { ok: false, message: "Kode akses salah atau kadaluarsa" },
        { status: 400 }
      );
    }

    // ==== Per-AKUN (jika login) ====
    let storedAsAccount = false;
    try {
      const u = await requireUser(req); // helper kamu harus mengembalikan objek user saat login
      if (!(u instanceof NextResponse) && (u as any)?.id) {
        await userAccessRepo.grant((u as any).id, verified.scope, verified.expiresAt ?? null);
        storedAsAccount = true;

        // penting: bersihkan cookie supaya akses tidak “nempel” ke browser untuk akun lain
        await clearAccessCookie();
      }
    } catch {
      // tidak login / helper tidak tersedia → lanjut ke cookie
    }

    // ==== Guest fallback (tidak login) → pakai cookie ====
    if (!storedAsAccount) {
      await writeAccessCookie([verified.scope], 60 * 60 * 24 * 7, verified.expiresAt ?? null);
    }

    return NextResponse.json({
      ok: true,
      data: {
        scope: verified.scope,
        storedAs: storedAsAccount ? "account" : "cookie",
        expiresAt: verified.expiresAt,
      },
      note: storedAsAccount
        ? "Kode valid & disimpan ke akun (cookie dibersihkan)."
        : "Kode valid & disimpan di cookie (guest).",
    });
  } catch (e) {
    console.error("[ACCESS_CODE_VERIFY_ERROR]", e);
    return NextResponse.json(
      { ok: false, message: "Gagal verifikasi kode" },
      { status: 500 }
    );
  }
}

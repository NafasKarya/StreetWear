// app/api/auth/admin/logout/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_REFRESH_COOKIE } from "@/lib/auth/adminAuth";
import { prisma } from "@/lib/db";
import { hashAccessToken } from "@/lib/auth/adminAccessToken";

export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  try {
    // 1) Ambil refresh token dari cookie (plaintext)
    const refreshPlain = req.cookies.get(ADMIN_REFRESH_COOKIE)?.value;

    if (refreshPlain) {
      // 2) Revoke di DB berdasarkan hash (tanpa butuh userId)
      const tokenHash = hashAccessToken(refreshPlain);
      // pakai updateMany biar gak tergantung unique index di userId
      await prisma.adminRefreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    // 3) Balas + hapus cookies (pakai path yang sama persis seperti saat set)
    const res = NextResponse.json({ ok: true, message: "Admin logged out" });

    // Session JWT (path "/")
    res.cookies.set(ADMIN_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",     // harus sama kayak waktu set
      maxAge: 0,     // expire now
    });

    // Refresh token (path "/api" sesuai login kamu)
    res.cookies.set(ADMIN_REFRESH_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api",  // harus sama
      maxAge: 0,
    });

    return res;
  } catch (err) {
    console.error("Admin logout error:", err);
    return NextResponse.json({ ok: false, message: "Logout gagal" }, { status: 500 });
  }
};

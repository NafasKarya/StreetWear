export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { userRepo } from "@/repositories/userRepo";
import { ADMIN_COOKIE, hashPassword, signAdminJwt } from "@/lib/auth/adminAuth";
import { generateAccessToken } from "@/lib/auth/adminAccessToken";
import { verifyInitialSetupAuth } from "@/lib/auth/setupGuard";

export const POST = async (req: NextRequest) => {
  try {
    const { email, password } = (await req.json()) ?? {};
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email & password wajib" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

    if (!ADMIN_EMAIL) {
      return NextResponse.json(
        { ok: false, message: "Server belum diset ADMIN_EMAIL" },
        { status: 500 }
      );
    }

    // 0) Super guard: x-setup-key + x-setup-jws + nonce + SETUP_DONE
    const check = await verifyInitialSetupAuth(req, ADMIN_EMAIL);
    if (!("ok" in check && check.ok)) {
      return NextResponse.json({ ok: false, message: check.msg }, { status: check.status });
    }

    // 1) DB-truth: kalau admin sudah ada, tolak total
    const adminCount = await userRepo.countAdmins();
    if (adminCount > 0) {
      return NextResponse.json(
        { ok: false, message: "Admin sudah ada. Nggak bisa nambah lagi." },
        { status: 403 }
      );
    }

    // 2) Email whitelist
    if (normalizedEmail !== ADMIN_EMAIL) {
      return NextResponse.json(
        { ok: false, message: "Email tidak diizinkan jadi admin" },
        { status: 403 }
      );
    }

    // 3) Cek email belum terpakai
    const exists = await userRepo.findByEmail(normalizedEmail);
    if (exists) {
      return NextResponse.json(
        { ok: false, message: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // 4) Create admin TUNGGAL — handle race condition
    const passwordHash = await hashPassword(password);
    let adminUser;
    try {
      adminUser = await userRepo.createAdmin(normalizedEmail, passwordHash);
    } catch (e: any) {
      const code = String(e?.code ?? "");
      const msg = String(e?.message ?? "");
      if (
        code === "ADMIN_ALREADY_EXISTS" ||
        code === "P2002" ||
        code === "1062" ||
        msg.includes("one_admin_only")
      ) {
        return NextResponse.json(
          { ok: false, message: "Admin sudah ada. Nggak bisa nambah lagi." },
          { status: 403 }
        );
      }
      throw e;
    }

    // 5) Terbitkan Admin Access Token HYBRID (JWS+JWE) pertama (valid 10 jam)
    const plainAccessToken = await generateAccessToken({
      uid: adminUser.id,        // number
      sub: normalizedEmail,     // email lowercase
      scope: "super",           // optional
      ttlSec: 10 * 60 * 60,     // 10 jam (opsional; default juga 10 jam)
    });
    const { expiresAt } = await userRepo.upsertAdminAccessToken(adminUser.id, plainAccessToken);

    // 6) Self-destruct: tandai setup selesai (menutup endpoint selamanya)
    await userRepo.setSetting("SETUP_DONE", "1");

    // 7) Set cookie sesi admin (JWT) + return token plaintext SEKALI INI
    const jwt = await signAdminJwt(normalizedEmail);
    const res = NextResponse.json(
      {
        ok: true,
        role: "admin",
        email: normalizedEmail,
        admin_access_token: plainAccessToken,
        expiresAt,
      },
      { status: 201 }
    );
    res.cookies.set(ADMIN_COOKIE, jwt.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: jwt.maxAge,
    });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
};

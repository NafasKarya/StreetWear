// app/api/auth/register/route.ts (atau ganti filemu yang tadi)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { userRepo } from "@/repositories/userRepo";
import { hashPassword } from "@/lib/auth/adminAuth"; // reuse util hash saja

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

    // 1) Cek email belum terpakai
    const exists = await userRepo.findByEmail(normalizedEmail);
    if (exists) {
      return NextResponse.json(
        { ok: false, message: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // 2) Buat user baru (role: user)
    const passwordHash = await hashPassword(password);

    // NOTE: sesuaikan dengan repo kamu.
    // Kalau kamu punya userRepo.createUser(email, hash) gunakan itu.
    // Kalau metodenya lain, ganti baris di bawah.
    const user = await userRepo.createUser(normalizedEmail, passwordHash);

    // 3) Return sukses (tanpa set cookie admin / access token)
    return NextResponse.json(
      {
        ok: true,
        role: "user",
        email: user.email,
        id: user.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
};

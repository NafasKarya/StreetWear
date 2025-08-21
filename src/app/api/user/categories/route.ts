export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { categoryRepo } from "@/repositories/categoryRepo";

export const GET = async () => {
  try {
    const items = await categoryRepo.listPublic();
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
};

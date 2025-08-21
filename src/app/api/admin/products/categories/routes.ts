export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { categoryRepo } from "@/repositories/categoryRepo";

export const POST = async (req: NextRequest) => {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { name } = await req.json();
    const cat = await categoryRepo.ensure(String(name || ""));
    return NextResponse.json({ ok: true, data: cat }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Gagal membuat kategori" },
      { status: 400 }
    );
  }
};

export const GET = async (req: NextRequest) => {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? undefined;
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");

    const result = await categoryRepo.list({ q, page, pageSize });
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");
    const name = searchParams.get("name");

    if (idStr) {
      await categoryRepo.deleteById(Number(idStr));
    } else if (name) {
      await categoryRepo.deleteByName(name);
    } else {
      return NextResponse.json(
        { ok: false, message: "Wajib kirim ?id= atau ?name=" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, message: "Kategori dihapus" });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
};

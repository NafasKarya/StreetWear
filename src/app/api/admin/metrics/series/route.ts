// src/app/api/admin/metrics/series/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { chartRepo } from "@/repositories/chartRepo";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const GET = async (req: NextRequest) => {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { searchParams } = new URL(req.url);
    const metric = searchParams.get("metric") || "";
    if (!metric) return NextResponse.json({ ok: false, message: "metric wajib" }, { status: 400 });

    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    const dim = searchParams.get("dim");

    const from = fromStr ? new Date(fromStr) : undefined;
    const to = toStr ? new Date(toStr) : undefined;

    const data = await chartRepo.series({ metric, from, to, dim: dim ?? undefined });
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    console.error("[METRICS_SERIES_ERROR]", e);
    return NextResponse.json({ ok: false, message: e?.message || "Gagal ambil series" }, { status: 500 });
  }
};

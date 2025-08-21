// src/app/api/admin/access-codes/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { accessCodeRepo } from "@/repositories/accessCodeRepo";

// ==============================
// Validasi scope untuk hidden product
//   - product:*          -> semua hidden
//   - product:{id}       -> produk tertentu
//   - drop:{slug}        -> grup/tema (huruf/angka/dash)
// ==============================
const SCOPE_RE = /^(product:\*|product:\d+|drop:[a-z0-9-]+)$/i;
function assertValidScope(scope: string) {
  if (!SCOPE_RE.test(scope)) {
    throw new Error(
      "Scope invalid. Gunakan salah satu pola: `product:*`, `product:{id}`, atau `drop:{slug}` (huruf/angka/dash)."
    );
  }
}

const PatchBody = z.object({
  label: z.string().min(1).optional(),
  scope: z.string().min(1).optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  enabled: z.boolean().optional(),
});

// Next 15: params adalah Promise
type Ctx = { params: Promise<{ id: string }> };

// ==============================
// GET /api/admin/access-codes/[id]
// ==============================
export async function GET(req: NextRequest, { params }: Ctx) {
  const { id: idStr } = await params;

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

    // Jangan expose tokenHash ke FE (good hygiene)
    const { tokenHash, ...rest } = existing as any;

    return NextResponse.json({ ok: true, data: rest });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Gagal mengambil data" }, { status: 500 });
  }
}

// ==============================
// PATCH /api/admin/access-codes/[id]
// ==============================
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id: idStr } = await params;

  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, message: "ID invalid" }, { status: 400 });
  }

  try {
    const json = await req.json();
    const body = PatchBody.parse(json);

    const existing = await accessCodeRepo.getById(id);
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    }

    // Validasi scope (kalau diganti)
    if (typeof body.scope === "string") {
      assertValidScope(body.scope);
    }

    const updated = await accessCodeRepo.update(id, {
      label: body.label ?? existing.label,
      scope: body.scope ?? existing.scope,
      maxUses: body.maxUses === undefined ? existing.maxUses : body.maxUses,
      expiresAt:
        body.expiresAt === undefined
          ? existing.expiresAt
          : body.expiresAt
          ? new Date(body.expiresAt)
          : null,
      enabled: body.enabled ?? existing.enabled,
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e: any) {
    if (e?.issues) {
      return NextResponse.json(
        { ok: false, message: "Body invalid", issues: e.issues },
        { status: 400 }
      );
    }
    if (e instanceof Error && e.message?.startsWith("Scope invalid")) {
      return NextResponse.json({ ok: false, message: e.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "Gagal update kode akses" },
      { status: 500 }
    );
  }
}

// ==============================
// DELETE /api/admin/access-codes/[id]
// (soft delete)
// ==============================
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id: idStr } = await params;

  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, message: "ID invalid" }, { status: 400 });
  }

  try {
    const deleted = await accessCodeRepo.softDelete(id);

    if (!deleted) {
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      data: { id: deleted.id, deletedAt: deleted.deletedAt },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "Gagal menghapus kode akses" },
      { status: 500 }
    );
  }
}

/*
NOTE:
- Endpoint untuk ROTATE token sebaiknya diletakkan di:
  /api/admin/access-codes/[id]/rotate (POST)
  (kamu sudah punya contohnya).
- PATCH di atas sekarang ngejaga supaya scope yang dipakai
  benar-benar sesuai dengan mekanisme hidden product.
*/

// src/app/api/admin/access-codes/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { accessCodeRepo } from "@/repositories/accessCodeRepo";
import { generateAccessToken, sha256Hex } from "@/lib/access/accessCode";

// ---- validation body ----
const CreateBody = z.object({
  label: z.string().min(1).optional(),
  scope: z.string().min(1),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(), // ISO
  prefix: z.string().optional(),
  length: z.number().int().positive().optional(),
  token: z.string().min(16).optional(),
});

// ---- POST /api/admin/access-codes ----
export const POST = async (req: NextRequest) => {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx; // 401

  try {
    const json = await req.json();
    const body = CreateBody.parse(json);

    // 1) generate plaintext (ditampilkan sekali)
    const plaintext =
      body.token ?? generateAccessToken({ prefix: body.prefix, length: body.length });
    const tokenHash = sha256Hex(plaintext);

    // 2) persist
    const created = await accessCodeRepo.create({
      label: body.label ?? null,
      scope: body.scope,
      tokenHash,
      maxUses: body.maxUses ?? null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      enabled: true,
    });

    // 3) response
    return NextResponse.json(
      {
        ok: true,
        data: {
          id: created.id,
          label: created.label,
          scope: created.scope,
          maxUses: created.maxUses,
          expiresAt: created.expiresAt,
          enabled: created.enabled,
          createdAt: created.createdAt,
        },
        access_token_plaintext: plaintext,
        note: "Simpan token ini sekarang. Setelah ini, server hanya menyimpan HASH-nya.",
      },
      { status: 201 }
    );
  } catch (e: any) {
    // ----- DEBUG: kirim detail saat DEV -----
    console.error("[ACCESS_CODE_CREATE_ERROR]", e);
    const isDev = process.env.NODE_ENV !== "production";

    if (e?.issues) {
      // Zod validation
      return NextResponse.json(
        { ok: false, dev: isDev, type: "ZodError", message: "Body invalid", issues: e.issues },
        { status: 400 }
      );
    }

    if (isDev) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // e.code contoh: P2002 (unique), P2000 (value too long), dll
        return NextResponse.json(
          {
            ok: false,
            dev: true,
            type: "KnownRequestError",
            code: e.code,
            meta: e.meta,
            message: e.message,
          },
          { status: 500 }
        );
      }
      if (e instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json(
          { ok: false, dev: true, type: "ValidationError", message: e.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          ok: false,
          dev: true,
          type: e?.name || "Error",
          message: e?.message || String(e),
        },
        { status: 500 }
      );
    }

    // PROD: generik
    return NextResponse.json({ ok: false, message: "Gagal membuat kode akses" }, { status: 500 });
  }
};

// ---- GET /api/admin/access-codes ----
export const GET = async (req: NextRequest) => {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx; // 401

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? undefined;
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");

    const result = await accessCodeRepo.list({ q, page, pageSize });
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("[ACCESS_CODE_LIST_ERROR]", e);
    return NextResponse.json(
      { ok: false, message: e?.message || "Gagal mengambil list" },
      { status: 500 }
    );
  }
};

// src/app/api/user/products/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readAccessScopesFromRequest } from "@/lib/access/accessCookie";
import { userAccessRepo } from "@/repositories/userAccessRepo";
import { requireUser } from "@/middlewares/requireUser";

function computeIsSoldOut(sizes: unknown): boolean {
  if (!Array.isArray(sizes)) return true;
  return sizes.every((s: any) => (s?.stock ?? 0) <= 0);
}

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? undefined;
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = Math.max(1, Math.min(100, Number(searchParams.get("pageSize") ?? "20")));
    const includeHiddenParam = searchParams.get("includeHidden") === "1";

    // ==== RESOLVE SCOPES: akun dulu, kalau tidak ada → cookie ====
    let scopes: string[] = [];
    let canSeeAllHidden = false;

    let u: any = null;
    try { u = await requireUser(req); } catch { u = null; }

    if (u && !(u instanceof NextResponse) && u?.id) {
      scopes = await userAccessRepo.scopes(u.id);
      // sesuaikan kalau kamu punya flag admin di objek user
      canSeeAllHidden = scopes.includes("product:*") || u.role === "admin";
    } else {
      // guest → fallback cookie
      scopes = await readAccessScopesFromRequest();
      canSeeAllHidden = scopes.includes("product:*");
    }

    // ==== WHERE ====
    const where: any = { deletedAt: null };

    if (q) {
      where.AND = [
        ...(where.AND ?? []),
        {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { productName: { contains: q, mode: "insensitive" } },
          ],
        },
      ];
    }

    // ==== GATING HIDDEN ====
    const includeHidden = includeHiddenParam || canSeeAllHidden || scopes.length > 0;
    if (includeHidden) {
      if (!canSeeAllHidden) {
        where.OR = [
          { isHidden: false },
          { AND: [{ isHidden: true }, { hiddenScope: { in: scopes } }] },
        ];
      }
      // admin/full access: tanpa tambahan filter
    } else {
      where.isHidden = false;
    }

    const skip = (page - 1) * pageSize;

    const [rows, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: pageSize }),
      prisma.product.count({ where }),
    ]);

    const items = rows.map((it) => {
      const sizes = Array.isArray((it as any).sizesJson) ? (it as any).sizesJson : [];
      const gallery = Array.isArray((it as any).galleryJson) ? (it as any).galleryJson : [];
      return {
        id: it.id,
        images: [it.frontImageUrl, ...(it.backImageUrl ? [it.backImageUrl] : []), ...gallery],
        frontImageUrl: it.frontImageUrl,
        backImageUrl: it.backImageUrl,
        gallery,
        title: it.title,
        productName: (it as any).productName ?? null,
        description: it.description,
        category: it.category,
        sizes,
        isSoldOut: computeIsSoldOut(sizes),
        expiresAt: it.expiresAt,
        createdAt: it.createdAt,
        createdBy: it.createdBy,
        isHidden: (it as any).isHidden ?? false,
        hiddenScope: (it as any).hiddenScope ?? null,
      };
    });

    return NextResponse.json({ ok: true, items, total, page, pageSize });
  } catch (e: any) {
    console.error("[PUBLIC_PRODUCTS_ERROR]", e);
    return NextResponse.json({ ok: false, message: e?.message || "Gagal mengambil list" }, { status: 500 });
  }
};

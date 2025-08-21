// src/app/api/admin/products/checkout/route.ts
export const runtime = "nodejs"; // Prisma butuh Node runtime (bukan Edge)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { chartRepo } from "@/repositories/chartRepo";
// import { Prisma } from "@prisma/client"; // ❌ tidak diperlukan lagi

type ReqItem = { productId: number; sizeLabel: string; qty: number };

export const POST = async (req: NextRequest) => {
  const ctx = await requireAdmin(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { items, note } = (await req.json()) as { items: ReqItem[]; note?: string };
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, message: "Items kosong" }, { status: 400 });
    }

    const orderRef = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const result = await prisma.$transaction(
      async (tx) => {
        const header = await tx.checkout.create({
          data: {
            orderRef,
            note: note ?? null,
            createdBy: (ctx as any)?.email ?? null,
          },
        });

        let grandTotal = 0;
        let totalQty = 0;

        // simpan ringkasan per-item buat metrics setelah commit
        const lineMetrics: Array<{
          productId: number;
          category: string | null;
          qty: number;
          price: number | null;
          currency: string | null;
        }> = [];

        for (const it of items) {
          if (!it?.productId || !it?.sizeLabel || !it?.qty) throw new Error("Data item tidak lengkap");

          // hormati soft delete & expiry (kalau ada kolom2 ini)
          const prod = await tx.product.findFirst({
            where: {
              id: it.productId,
              // hapus 2 baris di bawah kalau schema kamu tidak punya kolom ini
              deletedAt: null,
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
          });
          if (!prod) throw new Error(`Produk ${it.productId} tidak ditemukan / nonaktif`);

          const sizes = Array.isArray(prod.sizesJson) ? [...(prod.sizesJson as any[])] : [];
          const idx = sizes.findIndex((s: any) => s?.label === it.sizeLabel);
          if (idx < 0) throw new Error(`Ukuran ${it.sizeLabel} tidak ada`);

          const row = sizes[idx] as any;
          const stock = Number(row?.stock ?? 0);
          const qty = Number(it.qty);
          if (!Number.isFinite(qty) || qty <= 0) throw new Error("Qty harus > 0");
          if (stock < qty) throw new Error(`Stok ${row.label} tidak cukup`);

          // Kurangi stok
          sizes[idx] = { ...row, stock: stock - qty };
          await tx.product.update({ where: { id: prod.id }, data: { sizesJson: sizes } });

          // harga/currency snapshot per size
          const toNum = (v: unknown) => (typeof v === "number" ? v : Number.isFinite(Number(v)) ? Number(v) : null);
          const snapPrice = toNum(row?.price);
          const snapCurr = typeof row?.currency === "string" ? row.currency : null;

          if (snapPrice != null) grandTotal += snapPrice * qty;
          totalQty += qty;

          await tx.checkoutItem.create({
            data: {
              checkoutId: header.id,
              productId: prod.id,
              sizeLabel: it.sizeLabel,
              qty,
              price: snapPrice,
              currency: snapCurr,
              snapshot: {
                productTitle: prod.title,
                productCategory: (prod as any).category ?? null,
                frontImageUrl: prod.frontImageUrl,
              } as any,
            },
          });

          lineMetrics.push({
            productId: prod.id,
            category: (prod as any).category ?? null,
            qty,
            price: snapPrice,
            currency: snapCurr,
          });
        }

        return { header, grandTotal, totalQty, lineMetrics };
      },
      { isolationLevel: "Serializable" }
    );

    // ===== Metrics (agregasi harian) — otomatis nambah di DB
    const now = new Date();

    // Total harian (semua produk)
    if (result.grandTotal != null) {
      await chartRepo.upsertDaily(now, "sales_amount", result.grandTotal);
    }
    await chartRepo.upsertDaily(now, "sales_qty", result.totalQty);

    // Per-item: event + agregasi per produk/kategori/currency
    for (const m of result.lineMetrics) {
      const lineAmount = m.price != null ? m.price * m.qty : null;

      // event detail per item
      await chartRepo.logEvent({
        type: "CHECKOUT_ITEM",
        productId: m.productId,
        qty: m.qty,
        amount: lineAmount,
        currency: m.currency ?? null,
        metadata: {
          checkoutId: result.header.id,
          orderRef: result.header.orderRef,
          category: m.category ?? null,
        },
      });

      // agregasi per produk
      await chartRepo.upsertDaily(now, "sales_qty", m.qty, `product=${m.productId}`);
      if (lineAmount != null) {
        await chartRepo.upsertDaily(now, "sales_amount", lineAmount, `product=${m.productId}`);
      }

      // agregasi per kategori (jika ada)
      if (m.category) {
        await chartRepo.upsertDaily(now, "sales_qty", m.qty, `category=${m.category}`);
        if (lineAmount != null) {
          await chartRepo.upsertDaily(now, "sales_amount", lineAmount, `category=${m.category}`);
        }
      }

      // agregasi per currency (jika ada)
      if (m.currency && lineAmount != null) {
        await chartRepo.upsertDaily(now, "sales_amount", lineAmount, `currency=${m.currency}`);
      }
    }

    // Event header (sekali)
    await chartRepo.logEvent({
      type: "CHECKOUT_CREATED",
      amount: result.grandTotal ?? null,
      currency: null,
      metadata: { checkoutId: result.header.id, orderRef: result.header.orderRef },
    });

    return NextResponse.json({
      ok: true,
      data: { checkoutId: result.header.id, orderRef: result.header.orderRef },
      message: "Checkout berhasil",
    });
  } catch (e: any) {
    console.error("[CHECKOUT_ERROR]", e);
    return NextResponse.json({ ok: false, message: e?.message || "Checkout gagal" }, { status: 500 });
  }
};

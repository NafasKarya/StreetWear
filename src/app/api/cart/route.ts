import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { requireUser } from "@/lib/auth/user/requireUser";

const postBody = z.object({
  productId: z.number().int().positive(),
  sizeLabel: z.string().min(1),
  qty: z.number().int().positive().optional().default(1),
  price: z.union([z.number(), z.string()]), // per-unit price
});

const patchBody = z.object({
  productId: z.number().int().positive(),
  sizeLabel: z.string().min(1),
  by: z.number().int().refine((n) => n !== 0, { message: "by cannot be 0" }),
});

function parseNumberLike(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

async function getOrCreateCart(userId: number) {
  // Atomic: menghindari race P2002 (unique constraint userId)
  const cart = await prisma.cart.upsert({
    where: { userId },      // pastikan di Prisma: model Cart { userId Int @unique }
    update: {},             // tidak perlu update apa-apa kalau sudah ada
    create: { userId },     // kalau belum ada → buat
  });
  return cart;
}

export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user; // 401

  const cart = await getOrCreateCart(user.userId);

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    cart: {
      id: cart.id,
      items: items.map((i) => ({
        productId: i.productId,
        sizeLabel: (i as any).sizeLabel ?? "", // NOTE: pastikan field ini ada di schema kamu
        qty: (i as any).qty ?? (i as any).quantity ?? 0, // dukung qty/quantity
        price: (i as any).price ? String((i as any).price) : "0",
      })),
    },
  });
}

export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => null);
  const parsed = postBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cart = await getOrCreateCart(user.userId);
  const { productId, sizeLabel, qty, price } = parsed.data;

  // NOTE: kode di bawah mengasumsikan ada unique index:
  // @@unique([cartId, productId, sizeLabel]) pada model CartItem
  const item = await prisma.cartItem.upsert({
    where: {
      cartId_productId_sizeLabel: { cartId: cart.id, productId, sizeLabel },
    },
    create: {
      cartId: cart.id,
      productId,
      sizeLabel,
      qty, // jika di schema kamu namanya 'quantity', ganti ke quantity: qty
      price: new Decimal(parseNumberLike(price).toFixed(2)), // pastikan field 'price' ada bertipe Decimal
    } as any,
    update: {
      qty: { increment: qty }, // kalau pakai 'quantity', ganti ke: quantity: { increment: qty }
      price: new Decimal(parseNumberLike(price).toFixed(2)),
    } as any,
  });

  return NextResponse.json({
    ok: true,
    item: {
      productId: item.productId,
      sizeLabel: (item as any).sizeLabel ?? "",
      qty: (item as any).qty ?? (item as any).quantity ?? 0,
      price: (item as any).price ? String((item as any).price) : "0",
    },
  });
}

export async function PATCH(req: NextRequest) {
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => null);
  const parsed = patchBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cart = await getOrCreateCart(user.userId);
  const { productId, sizeLabel, by } = parsed.data;

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_sizeLabel: { cartId: cart.id, productId, sizeLabel },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Item not found in your cart" }, { status: 404 });
  }

  const currentQty =
    (existing as any).qty ?? (existing as any).quantity ?? 0;
  const newQty = currentQty + by;

  if (newQty <= 0) {
    await prisma.cartItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, removed: true });
  }

  const updated = await prisma.cartItem.update({
    where: { id: existing.id },
    data: {
      // jika schema pakai 'quantity' ganti baris di bawah
      qty: newQty,
      // quantity: newQty,
    } as any,
  });

  return NextResponse.json({
    ok: true,
    item: {
      productId: updated.productId,
      sizeLabel: (updated as any).sizeLabel ?? "",
      qty: (updated as any).qty ?? (updated as any).quantity ?? 0,
      price: (updated as any).price ? String((updated as any).price) : "0",
    },
  });
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Use PATCH with by:-qty to decrease / remove." },
    { status: 405 }
  );
}

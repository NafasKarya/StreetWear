import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function toDec(n: number | string | Prisma.Decimal) {
  return n instanceof Prisma.Decimal ? n : new Prisma.Decimal(n as any);
}

export const cartRepo = {
  async ensureCart(userId: number) {
    return prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  },

  async get(userId: number) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    return cart ?? { id: 0, userId, items: [] };
  },

  async addItem(userId: number, productId: number, sizeLabel: string, qty: number, price: number | string) {
    const cart = await this.ensureCart(userId);
    await prisma.cartItem.upsert({
      where: { cartId_productId_sizeLabel: { cartId: cart.id, productId, sizeLabel } },
      update: { qty: { increment: qty }, price: toDec(price) },
      create: { cartId: cart.id, productId, sizeLabel, qty, price: toDec(price) },
    });
  },

  async changeQty(userId: number, productId: number, sizeLabel: string, by: number) {
    const cart = await this.ensureCart(userId);
    const key = { cartId_productId_sizeLabel: { cartId: cart.id, productId, sizeLabel } };
    const item = await prisma.cartItem.findUnique({ where: key });
    if (!item) return;
    const next = item.qty + by;
    if (next <= 0) await prisma.cartItem.delete({ where: key });
    else await prisma.cartItem.update({ where: key, data: { qty: next } });
  },

  async removeItem(userId: number, productId: number, sizeLabel: string) {
    const cart = await this.ensureCart(userId);
    await prisma.cartItem
      .delete({ where: { cartId_productId_sizeLabel: { cartId: cart.id, productId, sizeLabel } } })
      .catch(() => {});
  },

  async clear(userId: number) {
    const cart = await this.ensureCart(userId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  },
};

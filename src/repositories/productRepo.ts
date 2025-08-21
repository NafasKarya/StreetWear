import prisma from "@/lib/prisma";

export type CreateProductInput = {
  frontImageUrl: string;
  backImageUrl: string | null;
  galleryJson?: string[];
  title: string;
  productName?: string | null;
  description: string;
  category: string;
  sizesJson: any[];
  expiresAt: Date | null;
  createdBy: string | null;

  // ⬇️ TAMBAHAN
  isHidden?: boolean;
  hiddenScope?: string | null;
};

export const productRepo = {
  async create(input: CreateProductInput) {
    if (!(prisma as any).product) {
      throw new Error(
        "Prisma client tidak punya model `product`. Jalankan `npx prisma generate` (dan migrate/push) lalu restart dev server."
      );
    }
    return prisma.product.create({
      data: {
        frontImageUrl: input.frontImageUrl,
        backImageUrl: input.backImageUrl,
        galleryJson: input.galleryJson ?? [],
        title: input.title,
        productName: input.productName ?? null,
        description: input.description,
        category: input.category,
        sizesJson: input.sizesJson as any,
        expiresAt: input.expiresAt,
        createdBy: input.createdBy ?? null,

        // ⬇️ SIMPAN HIDDEN & SCOPE
        isHidden: !!input.isHidden,
        hiddenScope: input.isHidden ? (input.hiddenScope ?? null) : null,
      },
    });
  },

  async list({ q, page, pageSize }: { q?: string; page: number; pageSize: number }) {
    const where: any = { deletedAt: null };

    if (q && q.trim()) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { productName: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  async delete(id: number, _deletedBy?: string | null) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new Error("Produk tidak ditemukan");

    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async hardDelete(id: number) {
    return prisma.product.delete({ where: { id } });
  },
};

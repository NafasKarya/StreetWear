import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";


type ListArgs = { q?: string; page?: number; pageSize?: number };

export const categoryRepo = {
  async ensure(name: string) {
    const n = String(name || "").trim();
    if (!n) throw new Error("Nama kategori wajib");
    const slug = slugify(n);
    return prisma.category.upsert({
      where: { slug },
      update: { name: n, deletedAt: null },
      create: { name: n, slug },
    });
  },

  async list({ q, page = 1, pageSize = 20 }: ListArgs) {
    const where = {
      deletedAt: null as Date | null,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q.toLowerCase() } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.category.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  async listPublic(): Promise<string[]> {
    const rows = await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { name: true },
    });
    return rows.map((r) => r.name);
  },

  async deleteById(id: number) {
    if (!id) throw new Error("ID tidak valid");
    // soft-delete? kalau mau hard-delete, ganti ke prisma.category.delete
    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async deleteByName(name: string) {
    const slug = slugify(name);
    const found = await prisma.category.findUnique({ where: { slug } });
    if (!found) return;
    await prisma.category.update({
      where: { id: found.id },
      data: { deletedAt: new Date() },
    });
  },
};

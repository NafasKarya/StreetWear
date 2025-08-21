// src/repositories/accessCodeRepo.ts
import prisma from "@/lib/prisma"; // default export, bukan { prisma }

export type CreateAccessCodeInput = {
  label: string | null;
  scope: string;
  tokenHash: string;
  maxUses: number | null;
  expiresAt: Date | null;
  enabled: boolean;
};

export const accessCodeRepo = {
  // ===== CREATE =====
  async create(input: CreateAccessCodeInput) {
    // sanity check di dev
    if (!(prisma as any).accessCode) {
      throw new Error(
        "Prisma client tidak punya model `accessCode`. " +
          "Cek schema Prisma & jalankan `npx prisma generate` lalu restart dev server."
      );
    }

    return prisma.accessCode.create({
      data: {
        label: input.label,
        scope: input.scope,
        tokenHash: input.tokenHash,
        maxUses: input.maxUses,
        expiresAt: input.expiresAt,
        enabled: input.enabled,
      },
    });
  },

  // ===== LIST (paging + q) =====
  // ⬇️ Fix: exclude soft-deleted (deletedAt: null) + total juga ikut filter
  async list({ q, page, pageSize }: { q?: string; page: number; pageSize: number }) {
    const baseWhere = { deletedAt: null as Date | null };
    const where = q
      ? {
          AND: [
            baseWhere,
            {
              OR: [
                { label: { contains: q } },
                { scope: { contains: q } },
              ],
            },
          ],
        }
      : baseWhere;

    const [items, total] = await Promise.all([
      prisma.accessCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.accessCode.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  // ===== GET BY ID =====
  async getById(id: number) {
    return prisma.accessCode.findUnique({ where: { id } });
  },

  // (opsional) Get hanya yang aktif
  async getByIdActive(id: number) {
    return prisma.accessCode.findFirst({ where: { id, deletedAt: null } });
  },

  // ===== UPDATE (partial) =====
  async update(
    id: number,
    data: Partial<{
      label: string | null;
      scope: string;
      maxUses: number | null;
      expiresAt: Date | null;
      enabled: boolean;
    }>
  ) {
    return prisma.accessCode.update({ where: { id }, data });
  },

  // ===== SOFT DELETE =====
  // ⬇️ Fix: idempotent & verifiable. Hanya set kalau belum terhapus.
  async softDelete(id: number) {
    const res = await prisma.accessCode.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (res.count === 0) {
      // tidak ada row yang berubah: bisa karena tidak ditemukan atau sudah terhapus
      return null;
    }
    // Kembalikan record terbaru (sudah punya deletedAt)
    return prisma.accessCode.findUnique({ where: { id } });
  },

  // ===== ROTATE TOKEN (ganti hash + reset usedCount) =====
  async rotateToken(id: number, tokenHash: string) {
    return prisma.accessCode.update({
      where: { id },
      data: { tokenHash, usedCount: 0 },
    });
  },

  // ===== VERIFY & CONSUME =====
  /**
   * Verifikasi tokenHash + konsumsi 1 use (increment usedCount).
   * Lolos jika:
   *  - enabled = true
   *  - deletedAt = null
   *  - expiresAt null ATAU > now
   *  - maxUses null ATAU usedCount < maxUses
   * Atomic via transaksi untuk meminimalkan race.
   */
  async verifyAndConsume(tokenHash: string) {
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      // 1) Ambil kandidat aktif
      const code = await tx.accessCode.findFirst({
        where: {
          tokenHash,
          enabled: true,
          deletedAt: null,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      });

      if (!code) return null;

      // 2) Cek kuota
      if (code.maxUses != null && code.usedCount >= code.maxUses) {
        return null;
      }

      // 3) Konsumsi
      const updated = await tx.accessCode.update({
        where: { id: code.id },
        data: { usedCount: { increment: 1 } },
      });

      // 4) Double-check (jaga-jaga race)
      if (updated.maxUses != null && updated.usedCount > updated.maxUses) {
        throw new Error("Race detected: usedCount melebihi maxUses");
      }

      return updated;
    });
  },
};

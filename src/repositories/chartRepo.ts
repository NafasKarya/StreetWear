// src/repositories/chartRepo.ts
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function toUtcDay(d: Date) {
  const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
  return new Date(Date.UTC(y, m, day, 0, 0, 0, 0));
}
function toDecimal(v: number | string | Prisma.Decimal) {
  return v instanceof Prisma.Decimal ? v : new Prisma.Decimal(v as any);
}
function decToNumber(v: Prisma.Decimal | number | string | null | undefined): number {
  if (v == null) return 0;
  return v instanceof Prisma.Decimal ? Number(v.toString()) : Number(v as any);
}

export const chartRepo = {
  // --- EVENT LOG RAW (tetap dipertahankan) ---
  async logEvent(data: {
    type: string;
    productId?: number | null;
    sizeLabel?: string | null;
    qty?: number | null;
    amount?: Prisma.Decimal | number | string | null;
    currency?: string | null;
    sessionId?: string | null;
    metadata?: any;
  }) {
    const amount = data.amount == null ? null : toDecimal(data.amount);
    await prisma.chartEvent.create({
      data: {
        type: data.type as any,
        productId: data.productId ?? null,
        sizeLabel: data.sizeLabel ?? null,
        qty: data.qty ?? null,
        amount,
        currency: data.currency ?? null,
        sessionId: data.sessionId ?? null,
        metadata: data.metadata ?? null,
      },
    });
  },

  // --- AGREGASI HARIAN (increment) ---
  async upsertDaily(date: Date, metric: string, inc: number | string | Prisma.Decimal, dim?: string | null) {
    const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const normalizedDim = dim ?? "";
    const amt = toDecimal(inc);
    await prisma.metricDaily.upsert({
      where: { date_metric_dim: { date: day, metric, dim: normalizedDim } },
      update: { value: { increment: amt } },
      create: { date: day, metric, dim: normalizedDim, value: amt },
    });
  },

  // --- TIME SERIES UNTUK ADMIN CHART ---
  /**
   * Ambil deret waktu per hari untuk metric tertentu.
   * - Jika `dim` diberikan -> kembalikan nilai per hari utk dim tsb.
   * - Jika `dim` tidak diberikan -> sum semua dim per hari.
   *
   * Param:
   *  metric: string (wajib)
   *  from?: Date (opsional)
   *  to?: Date (opsional)
   *  dim?: string (opsional)
   *
   * Return:
   *  Array<{ date: string (YYYY-MM-DD UTC), value: number }> (kalau dim tidak ada)
   *  atau Array<{ date: string, value: number, dim: string }> (kalau dim spesifik — dim ikut disertakan)
   */
  async series({ metric, from, to, dim }: { metric: string; from?: Date; to?: Date; dim?: string }) {
    if (!metric) throw new Error("metric wajib");

    const whereBase: any = { metric };
    // Rentang tanggal (pakai UTC midnight harian)
    if (from || to) {
      const gte = from ? toUtcDay(from) : undefined;
      const lte = to ? toUtcDay(to) : undefined;
      whereBase.date = {};
      if (gte) whereBase.date.gte = gte;
      if (lte) whereBase.date.lte = lte;
    }

    // Jika dim diberikan -> ambil langsung dari baris harian tsb
    if (typeof dim === "string" && dim.length > 0) {
      const rows = await prisma.metricDaily.findMany({
        where: { ...whereBase, dim },
        orderBy: { date: "asc" },
        select: { date: true, value: true, dim: true },
      });

      return rows.map(r => ({
        date: new Date(Date.UTC(
          r.date.getUTCFullYear(),
          r.date.getUTCMonth(),
          r.date.getUTCDate(), 0, 0, 0, 0
        )).toISOString().slice(0, 10), // YYYY-MM-DD UTC
        value: decToNumber(r.value),
        dim: r.dim,
      }));
    }

    // Jika dim tidak diberikan -> sum semua dim per tanggal
    const groups = await prisma.metricDaily.groupBy({
      by: ["date"],
      where: whereBase,
      _sum: { value: true },
      orderBy: { date: "asc" },
    });

    return groups.map(g => ({
      date: new Date(Date.UTC(
        g.date.getUTCFullYear(),
        g.date.getUTCMonth(),
        g.date.getUTCDate(), 0, 0, 0, 0
      )).toISOString().slice(0, 10),
      value: decToNumber(g._sum.value),
    }));
  },
};

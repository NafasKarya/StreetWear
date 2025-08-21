// src/components/product/utils.ts
import { ProductItem } from "./types";

/** Ambil harga untuk card (ambil dari size pertama bila ada) */
export const getPriceStr = (p: ProductItem): string => {
  const raw = p?.sizes?.[0]?.price;
  if (typeof raw === "number") return String(raw);
  if (typeof raw === "string") return raw;
  return "0";
};

/** Normalisasi array images untuk cover & detail */
export const buildImages = (p: ProductItem): string[] => {
  const arr =
    p.images && p.images.length > 0
      ? p.images
      : [p.frontImageUrl, p.backImageUrl ?? undefined, ...(p.gallery ?? [])];

  return Array.from(
    new Set(
      (arr as (string | undefined)[])
        .filter((s): s is string => !!s && s.trim() !== "")
        .map((s) =>
          // PENTING: hapus prefix '/uploads/' atau 'uploads/' di awal path kalau ada!
          s.replace(/^\/?uploads\//, "")
        )
    )
  );
};

/** Tentukan sold-out: pakai flag API, fallback cek sizes */
export const isSoldOutProduct = (p: ProductItem): boolean => {
  if (p?.isSoldOut) return true;
  if (Array.isArray(p?.sizes) && p.sizes.length > 0) {
    return p.sizes.every((s) => Number(s?.stock ?? 0) <= 0);
  }
  return false;
};

/** Grouping by title untuk tampilan list */
export const groupByTitle = (items: ProductItem[]) =>
  items.reduce((acc, p) => {
    const key = p.title || "Tanpa Judul";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, ProductItem[]>);

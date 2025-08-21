// src/components/product/hooks/usePublicProducts.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductItem as BaseProductItem } from "../components/types";

// biar aman, extend tipenya (kalau tipe aslinya belum include)
type ProductItem = BaseProductItem & { productName?: string | null };

type ListResp = { ok: boolean; items: ProductItem[] };

export default function usePublicProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ⬇️ PENTING: pindah ke /api/products (endpoint yang kirim productName)
      const res = await fetch("/api/user/products", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as ListResp;
      if (!res.ok || !data?.ok) {
        throw new Error("Gagal mengambil produk");
      }

      // Normalisasi ringan: pastikan field productName ada (fallback ke title)
      const withName = (Array.isArray(data.items) ? data.items : []).map((p) => ({
        ...p,
        productName: (p as any).productName ?? p.title ?? null,
      })) as ProductItem[];

      setProducts(withName);
    } catch (e: any) {
      setError(e?.message || "Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    products,
    setProducts,
    loading,
    error,
    reload,
  };
}

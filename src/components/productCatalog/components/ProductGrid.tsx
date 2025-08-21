"use client";

import React, { useMemo } from "react";
import type { ProductItem } from "./types";
import ProductCardWithBadge from "./ProductCardWithBadge";

type Props = {
  products: ProductItem[];
  onSelect: (p: ProductItem) => void;

  // Admin opsional
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
  onHide?: (id: number) => void;         // ⬅️ TAMBAH INI
  deletingIds?: Set<number>;
};

export default function ProductGrid({
  products,
  onSelect,
  isAdmin = false,
  onDelete,
  onHide,            // ⬅️ TERIMA DI SINI
  deletingIds,
}: Props) {
  // Grup berdasarkan title asli
  const grouped = useMemo(() => {
    const map = new Map<string, ProductItem[]>();
    for (const p of products || []) {
      const key = p.title || "Untitled";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [products]);

  if (grouped.size === 0) {
    return <p className="text-gray-500 italic">Belum ada produk yang cocok</p>;
  }

  return (
    <>
      {Array.from(grouped.entries()).map(([title, items]) => (
        <div key={title} className="mb-10">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 mt-8">{title}</h3>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
            {items.map((p) => (
              <ProductCardWithBadge
                key={p.id}
                product={p}
                onClick={() => onSelect(p)}
                isAdmin={isAdmin}
                onDelete={onDelete ? () => onDelete(p.id) : undefined}
                onHide={onHide ? () => onHide(p.id) : undefined}   // ⬅️ TERUSKAN KE BAWAH
                deletingIds={deletingIds}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

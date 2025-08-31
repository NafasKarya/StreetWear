"use client";

import React from "react";
import type { ProductItem } from "./types";
import ProductCardWithBadge from "./ProductCardWithBadge";

type Props = {
  products: ProductItem[];
  onSelect: (p: ProductItem) => void;
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
  onHide?: (id: number) => void;
  deletingIds?: Set<number>;
};

export default function ProductGrid({
  products,
  onSelect,
  isAdmin = false,
  onDelete,
  onHide,
  deletingIds,
}: Props) {
  // PURE UI: Tidak ada grouping, tidak ada logic apa pun

  if (!products || products.length === 0) {
    return <p className="text-gray-500 italic">Belum ada produk yang cocok</p>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
      {products.map((p) => (
        <ProductCardWithBadge
          key={p.id}
          product={p}
          onClick={() => onSelect(p)}
          isAdmin={isAdmin}
          onDelete={onDelete ? () => onDelete(p.id) : undefined}
          onHide={onHide ? () => onHide(p.id) : undefined}
          deletingIds={deletingIds}
        />
      ))}
    </div>
  );
}

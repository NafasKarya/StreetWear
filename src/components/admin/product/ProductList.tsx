// ProductList.tsx
"use client";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

import { Product } from "@/store/type/types";
import { useAdminProductStore } from "@/store/admin/product/useAdminProductStore";

type Props = {
  products: Product[];
};

export const ProductItem = React.memo(
  ({ product, index }: { product: Product; index: number }) => {
    const router = useRouter();
    const { deleteProduct } = useAdminProductStore();

    const displayPrice = useMemo(() => {
      const sizeS = product.sizes?.find((s) => s.size.toUpperCase() === "S");
      if (sizeS) return Number(sizeS.price);
      if (product.sizes && product.sizes.length > 0) {
        return Math.min(...product.sizes.map((s) => Number(s.price)));
      }
      return null;
    }, [product.sizes]);

    const expiredDate = useMemo(
      () => new Date(product.expired_at).toLocaleDateString("en-GB"),
      [product.expired_at]
    );

    return (
      <li className="flex flex-col gap-2">
        <div
          className="relative w-full h-72 rounded-xl overflow-hidden border border-white/10 shadow-md hover:shadow-xl transition group cursor-pointer"
          onClick={() => router.push(`/admins/${product.uuid}`)}
        >
          <Image
            src={product.front_image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={index === 0}
          />
          {product.back_image && (
            <Image
              src={product.back_image}
              alt={`${product.title} hover`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </div>

        <div className="px-1 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs sm:text-sm text-zinc-400">{product.name}</p>
            {displayPrice !== null && (
              <p className="text-sm font-semibold text-emerald-400">
                Rp {displayPrice.toLocaleString("id-ID")}
              </p>
            )}
            <p className="mt-1 text-[10px] sm:text-xs text-zinc-500 uppercase">
              Exp: {expiredDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admins/edit/${product.uuid}`);
              }}
              className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 transition"
              title="Edit Product"
            >
              <Pencil className="h-5 w-5 text-emerald-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteProduct(product.uuid);
              }}
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 transition"
              title="Delete Product"
            >
              <Trash2 className="h-5 w-5 text-red-400" />
            </button>
          </div>
        </div>
      </li>
    );
  }
);
ProductItem.displayName = "ProductItem";

export default function ProductList({ products }: Props) {
  const groupedProducts = useMemo(
    () =>
      Object.entries(
        products.reduce((acc: Record<string, Product[]>, p) => {
          (acc[p.title] ||= []).push(p);
          return acc;
        }, {})
      ),
    [products]
  );

  return (
    <div className="flex flex-col gap-12 mt-6">
      {groupedProducts.map(([title, group]) => (
        <section key={title} className="flex flex-col gap-4">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white px-1">
            {title}
          </h2>
          <ul className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {group.map((product, index) => (
              <ProductItem key={product.uuid} product={product} index={index} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

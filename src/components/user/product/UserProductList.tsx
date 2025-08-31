"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useUserProduct } from "@/store/user/product/useUserProduct";

type Product = {
  id: number | string;
  uuid: string;
  title: string;
  name: string;
  price: number;
  stock: number;
  front_image: string;
  back_image?: string;
  category_uuid: string;
  category_name: string;
  category_slug: string;
  expired_at?: string;
};

const DEFAULT_IMAGE = "/assets/no-image.png";

function getSafeImageUrl(img?: string) {
  if (!img || typeof img !== "string" || img.length < 8) return DEFAULT_IMAGE;
  return img;
}

// Card Produk dengan loader overlay
export const UserProductItem = React.memo(
  ({
    product,
    index,
    onClick,
    isLoading,
    disabled,
  }: {
    product: Product;
    index: number;
    onClick?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
  }) => {
    return (
      <div
        className={`flex flex-col gap-2 cursor-pointer relative ${
          disabled ? "opacity-60 pointer-events-none" : ""
        }`}
        onClick={onClick}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        <div className="relative w-full h-72 rounded-xl overflow-hidden border border-white/10 shadow-md group">
          <Image
            src={getSafeImageUrl(product.front_image)}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={index === 0}
          />
          {product.back_image && (
            <Image
              src={getSafeImageUrl(product.back_image)}
              alt={`${product.title} hover`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
          {/* Loader Kecil Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10">
              <svg className="animate-spin h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          )}
        </div>
        <div className="px-1 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs sm:text-sm text-zinc-400">{product.name}</p>
            <p className="text-xs text-zinc-500 uppercase">{product.category_name}</p>
            {product.price !== undefined && (
              <p className="text-sm font-semibold text-emerald-400">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            )}
            {product.expired_at && (
              <p className="mt-1 text-[10px] sm:text-xs text-zinc-500 uppercase">
                Exp: {product.expired_at}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);
UserProductItem.displayName = "UserProductItem";

export default function UserProductList({
  onProductClick,
}: {
  onProductClick?: (id: string | number) => void;
}) {
  const { products, isLoading, error, fetchProducts } = useUserProduct();
  const [loadingUuid, setLoadingUuid] = useState<string | number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const groupedProducts = useMemo(() => {
    return Object.entries(
      products.reduce((acc: Record<string, Product[]>, p: Product) => {
        (acc[p.title] ||= []).push(p);
        return acc;
      }, {})
    );
  }, [products]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 gap-2">
        <span className="text-emerald-400 text-sm animate-pulse">
          Loading produk...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 gap-2">
        <span className="text-red-500 text-sm">{error}</span>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center gap-2 text-zinc-300 mt-20">
        <span className="italic">No products found.</span>
      </div>
    );
  }

  const handleProductClick = (uuid: string | number) => {
    setLoadingUuid(uuid);
    onProductClick?.(uuid);
  };

  return (
    <div className="flex flex-col gap-12 mt-6">
      {groupedProducts.map(([title, group]) => (
        <section key={title} className="flex flex-col gap-4">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white px-1">
            {title}
          </h2>
          <ul className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {group.map((product, index) => (
              <UserProductItem
                key={product.uuid || product.id}
                product={product}
                index={index}
                onClick={() => handleProductClick(product.uuid)}
                isLoading={loadingUuid === product.uuid}
                disabled={!!loadingUuid}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

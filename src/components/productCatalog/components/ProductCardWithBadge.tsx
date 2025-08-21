"use client";

import React from "react";
import AdminImageCardProduct from "../AdminImageCardProduct";
import type { ProductItem } from "./types";
import { buildImages, getPriceStr, isSoldOutProduct } from "./utils";
import { toPublicUrl } from "@/lib/upload/paths";

type Props = {
  product: ProductItem;
  onClick?: () => void;
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
  onHide?: (id: number) => void;
  deletingIds?: Set<number>;
};

export default function ProductCardWithBadge({
  product,
  onClick,
  isAdmin = false,
  onDelete,
  onHide,
  deletingIds,
}: Props) {
  const imgs = buildImages(product);
  const soldOut = isSoldOutProduct(product);

  // Fix path: convert relative path to public url sekali saja
  const frontImageUrl = imgs[0] ? toPublicUrl(imgs[0]) : "";
  const backImageUrl = imgs[1] ? toPublicUrl(imgs[1]) : undefined;

  // === DEBUG LOG DI SINI ===
  console.log("IMAGE DEBUG:", {
    imgs, // hasil buildImages
    frontImageUrl, // hasil final untuk FE
    backImageUrl,
    productRaw: product, // data asli product
  });

  const cardProps = {
    id: product.id,
    frontImage: frontImageUrl,
    backImage: backImageUrl,
    name: (product as any).productName || product.title,
    title: product.title,
    price: getPriceStr(product),
    productDetail: product.description,
    discount: 0,
    voucher: "",
    tax: "0",
    shipping: "0",
    rating: 0,
    stock: soldOut ? 0 : 9999,
    onClick,
    isAdmin,
    onDelete,
    onHide,
    deletingIds,
  } as any;

  return (
    <div className={`relative ${soldOut ? "opacity-60" : ""}`}>
      {soldOut && (
        <span className="absolute top-2 left-2 z-10 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
          SOLD OUT
        </span>
      )}
      {product.category && (
        <span className="absolute top-2 left-2 translate-y-6 z-10 rounded bg-yellow-400 text-black px-2 py-[2px] text-[10px]">
          {product.category}
        </span>
      )}
      <AdminImageCardProduct {...cardProps} />
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";

import Image from "next/image";
import { Loader2, X, ShoppingCart, CreditCard } from "lucide-react";
import { ProductSizeInput } from "@/store/type/types";
import clsx from "clsx";
import CardDetailCategory from "./CardDetailCategory";
import { useAdminProductStore } from "@/store/admin/product/useAdminProductStore";

interface DetailProductAdminProps {
  productId: string | null;
  onClose?: () => void;
}

export default function DetailProductAdmin({
  productId,
  onClose,
}: DetailProductAdminProps) {
  const { getProductDetail, productDetail, loading, error } =
    useAdminProductStore();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSizeInput | null>(
    null
  );

  useEffect(() => {
    if (productId) getProductDetail(productId);
  }, [productId, getProductDetail]);

  useEffect(() => {
    if (!productDetail) return;
    setSelectedImage(productDetail.front_image || null);
    if (productDetail.sizes?.length > 0) {
      setSelectedSize(productDetail.sizes[0]);
    }
  }, [productDetail]);

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />

      {/* Close Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 h-9 w-9 sm:h-10 sm:w-10 
            rounded-full bg-white/10 border border-white/20 
            text-white hover:bg-white/20 flex items-center justify-center transition"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-2 sm:mx-4 lg:mx-12 overflow-y-auto max-h-[95vh] p-4 sm:p-6 scrollbar-hide">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-white">
            <Loader2 className="animate-spin h-8 w-8 mb-4 text-white/80" />
            <span className="text-zinc-300">Loading product detail...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center text-red-400 font-semibold py-8">
            {error}
          </div>
        )}

        {!loading && !error && !productDetail && (
          <div className="flex items-center justify-center text-zinc-400 py-8">
            Product detail not found.
          </div>
        )}

        {productDetail && (
          <>
            {/* Grid utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 text-white">
              {/* LEFT - IMAGE */}
              <div className="flex flex-col gap-3">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                  {selectedImage && (
                    <Image
                      key={selectedImage}
                      src={selectedImage}
                      alt={productDetail.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw,
                             (max-width: 1200px) 50vw,
                             33vw"
                      className="object-cover transition-transform duration-500 ease-in-out hover:scale-[1.05]"
                    />
                  )}
                </div>

                {/* Thumbnail Gallery */}
                <div className="flex gap-2 sm:gap-3 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                  {[
                    productDetail.front_image,
                    productDetail.back_image,
                    ...(productDetail.gallery_images || []),
                  ]
                    .filter(Boolean)
                    .map((img: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className={clsx(
                          "relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden shrink-0 border-2 transition",
                          selectedImage === img
                            ? "border-yellow-400"
                            : "border-transparent hover:border-white/30"
                        )}
                      >
                        <Image
                          src={img}
                          alt={`thumb-${i}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                </div>
              </div>

              {/* RIGHT - INFO */}
              <div className="flex flex-col gap-5 sm:gap-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-wide">
                  {productDetail.name}
                </h2>

                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-300">
                  Rp
                  {selectedSize
                    ? Number(selectedSize.price).toLocaleString()
                    : "0"}
                </p>

                {selectedSize && (
                  <p className="text-sm text-zinc-400">
                    Stok: {selectedSize.stock}
                  </p>
                )}

                {/* Pilih ukuran */}
                {productDetail.sizes?.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-2 sm:mb-3">
                      Pilih Ukuran
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {productDetail.sizes.map((sz: ProductSizeInput, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSize(sz)}
                          className={clsx(
                            "flex items-center justify-center py-2 sm:py-3 rounded-xl transition text-xs sm:text-sm font-bold uppercase shadow-md border",
                            selectedSize?.size === sz.size
                              ? "bg-yellow-400 text-black border-yellow-400"
                              : "bg-white/5 hover:bg-white/15 hover:border-yellow-300/40 border-transparent"
                          )}
                        >
                          {sz.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deskripsi */}
                <div className="mt-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4">
                  <p className="text-sm md:text-base text-zinc-300/90 leading-relaxed">
                    {productDetail.description}
                  </p>
                </div>

                {/* Action Buttons sejajar - Glass style */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    className="flex items-center justify-center gap-2 w-full py-3 sm:py-4 
                      rounded-2xl font-bold uppercase tracking-widest
                      bg-white/10 backdrop-blur-md border border-white/20 text-white
                      hover:bg-white/20 transition"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </button>

                  <button
                    className="flex items-center justify-center gap-2 w-full py-3 sm:py-4 
                      rounded-2xl font-bold uppercase tracking-widest
                      bg-white/10 backdrop-blur-md border border-white/20 text-white
                      hover:bg-white/20 transition"
                  >
                    <CreditCard className="h-5 w-5" />
                    Checkout
                  </button>
                </div>

                {onClose && (
                  <button
                    onClick={onClose}
                    className="w-full py-3 sm:py-4 rounded-2xl font-bold uppercase tracking-widest
                      bg-white/10 hover:bg-white/20 text-white border border-white/20 transition mt-3"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>

            {/* Category Card */}
            <div className="mt-8">
              <CardDetailCategory />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

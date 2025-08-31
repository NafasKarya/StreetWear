"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, ShoppingCart, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import CardDetailCategoryUser from "./CardDetailCategoryUser";
import { useUserShowProduct } from "@/store/user/product/useUserShowProduct";
import { ProductSizeInput } from "@/store/type/types";
import { useUserCreateCartStore } from "@/store/user/cart/useUserCreateCartStore";
import UserFloatingCart from "@/components/user/cart/UserFloatingCart";

interface DetailProductUserProps {
  productId: string | number | null;
  onClose?: () => void;
}

export default function DetailProductUser({ productId, onClose }: DetailProductUserProps) {
  const { product, isLoading, error, fetchProduct } = useUserShowProduct();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSizeInput | null>(null);
  const [qty, setQty] = useState(1);

  const {
    isLoading: isCartLoading,
    isSuccess: isCartSuccess,
    error: cartError,
    createCart,
  } = useUserCreateCartStore();

  useEffect(() => {
    if (productId) fetchProduct(productId);
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    setSelectedImage(product.front_image || null);
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setQty(1);
  }, [product]);

  const handleAddToCart = async () => {
    if (!product?.id || !selectedSize?.size) return;
    await createCart({
      product_id: product.id,
      size: selectedSize.size,
      quantity: qty,
    });
  };

  useEffect(() => {
    if (isCartSuccess) {
      const timer = setTimeout(() => {
        useUserCreateCartStore.setState({ isSuccess: false });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isCartSuccess]);

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 h-9 w-9 sm:h-10 sm:w-10 
            rounded-full bg-white/10 border border-white/20 
            text-white hover:bg-white/20 flex items-center justify-center transition"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      <div className="relative w-full max-w-7xl mx-2 sm:mx-4 lg:mx-12 overflow-y-auto max-h-[95vh] p-4 sm:p-6 scrollbar-hide text-white">
        {isLoading && (
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

        {!isLoading && !error && !product && (
          <div className="flex items-center justify-center text-zinc-400 py-8">
            Product detail not found.
          </div>
        )}

        {product && (
          <>
            <div className="min-h-[28px] mb-2">
              {isCartLoading && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Loader2 className="animate-spin h-5 w-5" /> Adding to cart...
                </div>
              )}
              {isCartSuccess && (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle className="h-5 w-5" /> Added to cart!
                </div>
              )}
              {cartError && (
                <div className="flex items-center gap-2 text-red-400 font-semibold">
                  <AlertCircle className="h-5 w-5" /> {cartError}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              <div className="flex flex-col gap-3">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                  {selectedImage && (
                    <Image
                      key={selectedImage}
                      src={selectedImage}
                      alt={product.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-in-out hover:scale-[1.05]"
                    />
                  )}
                </div>
                <div className="flex gap-2 sm:gap-3 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                  {[
                    product.front_image,
                    product.back_image,
                    ...(Array.isArray(product.gallery_images) ? product.gallery_images : []),
                  ]
                    .filter(Boolean)
                    .map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(img as string)}
                        className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${selectedImage === img
                            ? "border-yellow-400"
                            : "border-transparent hover:border-white/30"
                          }`}
                      >
                        <Image
                          src={img as string}
                          alt={`thumb-${i}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex flex-col gap-5 sm:gap-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-wide">
                  {product.name}
                </h2>
                <p className="text-xs text-zinc-500 uppercase">{product.category_name}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-300">
                  Rp
                  {selectedSize
                    ? Number(selectedSize.price).toLocaleString()
                    : Number(product.price).toLocaleString()}
                </p>
                <p className="text-sm text-zinc-400">
                  Stok:{" "}
                  {selectedSize?.stock ?? product.stock ?? "?"}
                </p>

                {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-2 sm:mb-3">
                      Pilih Ukuran
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {product.sizes.map((sz: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSize(sz)}
                          className={`flex items-center justify-center py-2 sm:py-3 rounded-xl transition text-xs sm:text-sm font-bold uppercase shadow-md border ${selectedSize?.size === sz.size
                              ? "bg-yellow-400 text-black border-yellow-400"
                              : "bg-white/5 hover:bg-white/15 hover:border-yellow-300/40 border-transparent"
                            }`}
                        >
                          {sz.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Jumlah</span>
                  <input
                    type="number"
                    min={1}
                    max={selectedSize?.stock ? Number(selectedSize.stock) : 99}
                    value={qty}
                    onChange={e => setQty(Number(e.target.value))}
                    className="w-16 py-1 px-2 rounded-lg bg-white/10 border border-white/20 text-center text-white focus:outline-none"
                    disabled={isCartLoading}
                  />
                </div>

                <div className="mt-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4">
                  <p className="text-sm md:text-base text-zinc-300/90 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    className={`flex items-center justify-center gap-2 w-full py-3 sm:py-4 
                      rounded-2xl font-bold uppercase tracking-widest
                      bg-white/10 backdrop-blur-md border border-white/20 text-white
                      hover:bg-white/20 transition
                      ${isCartLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                    onClick={handleAddToCart}
                    disabled={isCartLoading}
                  >
                    {isCartLoading ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <ShoppingCart className="h-5 w-5" />
                    )}
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

            <div className="mt-8">
              <CardDetailCategoryUser />
            </div>
            <UserFloatingCart />
          </>
        )}
      </div>
    </div>
  );
}

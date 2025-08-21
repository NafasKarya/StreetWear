"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useCart } from "../cart/CartContext";
import Header from "../header/Header";

// ===== IMPORT HELPER FIXED =====
import { toPublicUrl } from "@/lib/upload/paths"; // FIXED

const ChevronLeft = (props: any) => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRight = (props: any) => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

type SizeRow = { label: string; stock: number; price?: number | string };

interface DetailProductProps {
  product: {
    id: number;
    name: string;
    price: string;
    images?: string[];
    frontImageUrl?: string;
    backImageUrl?: string | null;
    gallery?: string[];
    imageUrl?: string;
    productDetail: string;
    sizes?: SizeRow[];
    category?: string | null;
  };
  onBack: () => void;
  categories?: string[];
}

/* ===== Metrics helpers ===== */
function ensureSid(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = "sid";
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = `sid_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      localStorage.setItem(key, sid);
    }
    return sid;
  } catch {
    return null;
  }
}

const memOnce = new Set<string>();
function oncePerSession(key: string): boolean {
  try {
    const k = `mx_once:${key}`;
    if (typeof window !== "undefined" && window.sessionStorage) {
      if (sessionStorage.getItem(k)) return false;
      sessionStorage.setItem(k, "1");
      return true;
    }
  } catch {}
  if (memOnce.has(key)) return false;
  memOnce.add(key);
  return true;
}

async function logMetricsEvent(payload: {
  type: string;
  productId?: number;
  sizeLabel?: string;
  qty?: number;
  metadata?: any;
}) {
  try {
    const sessionId = typeof window !== "undefined" ? ensureSid() : null;
    const body = JSON.stringify({ ...payload, sessionId });

    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const ok = navigator.sendBeacon("/api/admin/metrics/event", new Blob([body], { type: "application/json" }));
      if (ok) return;
    }

    await fetch("/api/admin/metrics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {}
}

export default function DetailProduct({ product, onBack, categories }: DetailProductProps) {
  const { addToCart } = useCart();
  const imgRef = useRef<HTMLImageElement | null>(null);

  const navCategories = useMemo(
    () => Array.from(new Set(Array.isArray(categories) ? categories.filter(Boolean) : [])),
    [categories]
  );

  /* images */
  const images = useMemo(() => {
    const raw =
      product.images && product.images.length > 0
        ? product.images
        : [product.frontImageUrl, product.backImageUrl ?? undefined, ...(product.gallery ?? []), product.imageUrl];
    const clean = (raw as (string | undefined)[]).filter((s): s is string => typeof s === "string" && s.trim().length > 0);
    return Array.from(new Set(clean));
  }, [product.images, product.frontImageUrl, product.backImageUrl, product.gallery, product.imageUrl]);

  const [activeIdx, setActiveIdx] = useState(0);
  const hasMany = images.length > 1;
  const currentSrc = images[activeIdx] ?? null;

  useEffect(() => {
    if (activeIdx >= images.length) setActiveIdx(0);
  }, [images.length, activeIdx]);

  const lastImageLog = useRef<{ idx: number; t: number } | null>(null);
  const logImageView = (idx: number, src: string) => {
    const now = Date.now();
    const last = lastImageLog.current;
    if (last && last.idx === idx && now - last.t < 500) return;
    lastImageLog.current = { idx, t: now };
    logMetricsEvent({ type: "PRODUCT_IMAGE_VIEW", productId: product.id, metadata: { index: idx, src } });
  };

  const handlePrev = () => {
    const nextIndex = hasMany ? (activeIdx === 0 ? images.length - 1 : activeIdx - 1) : 0;
    setActiveIdx(nextIndex);
    if (images[nextIndex]) logImageView(nextIndex, images[nextIndex]);
  };
  const handleNext = () => {
    const nextIndex = hasMany ? (activeIdx === images.length - 1 ? 0 : activeIdx + 1) : 0;
    setActiveIdx(nextIndex);
    if (images[nextIndex]) logImageView(nextIndex, images[nextIndex]);
  };

  /* sizes */
  const normalizedSizes: SizeRow[] = useMemo(() => {
    const s = Array.isArray(product.sizes) ? product.sizes : [];
    return s
      .map((it) => ({
        label: String(it.label ?? "").trim(),
        stock: Number(it.stock ?? 0),
        price: typeof it.price === "string" ? it.price : typeof it.price === "number" ? it.price : undefined,
      }))
      .filter((it) => it.label.length > 0);
  }, [product.sizes]);

  const defaultSizeIdx = useMemo(() => {
    const idx = normalizedSizes.findIndex((s) => s.stock > 0);
    return idx >= 0 ? idx : 0;
  }, [normalizedSizes]);

  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number>(defaultSizeIdx);
  useEffect(() => setSelectedSizeIdx(defaultSizeIdx), [defaultSizeIdx]);

  const selectedSize = normalizedSizes[selectedSizeIdx];
  const selectedSizeLabel = selectedSize?.label ?? "";
  const selectedInStock = (selectedSize?.stock ?? 0) > 0;

  const displayPrice = useMemo(() => {
    const p = selectedSize?.price;
    if (typeof p === "number") return String(p);
    if (typeof p === "string" && p.trim() !== "") return p;
    return product.price;
  }, [selectedSize?.price, product.price]);

  /* one-time logs */
  useEffect(() => {
    if (oncePerSession(`pv:${product.id}`)) {
      logMetricsEvent({ type: "PRODUCT_VIEW", productId: product.id, metadata: { name: product.name } });
    }
    if (images[0] && oncePerSession(`piv:${product.id}:0`)) {
      logMetricsEvent({ type: "PRODUCT_IMAGE_VIEW", productId: product.id, metadata: { index: 0, src: images[0] } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  /* add to cart */
  const handleAddToCart = async () => {
    const chosenImage = currentSrc ?? "";
    const img = imgRef.current;
    const cart = document.getElementById("cart-icon");

    const doAdd = () => {
      addToCart({
        id: product.id,
        name: product.name,
        price: displayPrice,
        imageUrl: chosenImage,
        size: selectedSizeLabel,
      });
      logMetricsEvent({
        type: "ADD_TO_CART",
        productId: product.id,
        sizeLabel: selectedSizeLabel,
        qty: 1,
        metadata: { price: displayPrice },
      });
    };

    if (img && cart && currentSrc) {
      const imgRect = img.getBoundingClientRect();
      const cartRect = cart.getBoundingClientRect();
      const flyingImg = img.cloneNode(true) as HTMLImageElement;
      flyingImg.style.position = "fixed";
      flyingImg.style.left = imgRect.left + "px";
      flyingImg.style.top = imgRect.top + "px";
      flyingImg.style.width = imgRect.width + "px";
      flyingImg.style.height = imgRect.height + "px";
      flyingImg.style.transition = "all 0.7s cubic-bezier(.71,-0.04,.29,1.03)";
      flyingImg.style.zIndex = "9999";
      flyingImg.style.pointerEvents = "none";
      document.body.appendChild(flyingImg);
      // @ts-ignore
      flyingImg.offsetWidth;
      flyingImg.style.left = cartRect.left + cartRect.width / 2 - imgRect.width / 4 + "px";
      flyingImg.style.top = cartRect.top + cartRect.height / 2 - imgRect.height / 4 + "px";
      flyingImg.style.width = imgRect.width / 2 + "px";
      flyingImg.style.height = imgRect.height / 2 + "px";
      flyingImg.style.opacity = "0.4";
      flyingImg.style.borderRadius = "30px";
      setTimeout(() => {
        document.body.removeChild(flyingImg);
        doAdd();
      }, 700);
    } else {
      doAdd();
    }
  };

  return (
    <div className="bg-black text-yellow-400 min-h-screen font-mono overflow-x-hidden">
      <Header />
      <div className="p-4 md:p-8">
        <button onClick={onBack} className="mr-2 text-yellow-400 hover:text-white flex items-center font-bold mb-6 mt-2">
          <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span className="ml-1">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar kategori (tanpa efek glow) */}
          <aside className="col-span-1">
            {navCategories.length > 0 && (
              <nav className="flex flex-row flex-wrap lg:flex-col gap-2 text-sm mb-8">
                {navCategories.map((cat) => {
                  const active =
                    (product.category || "").trim() === cat || (cat === "All" && !(product.category || "").trim());
                  return (
                    <span
                      key={cat}
                      className={[
                        "cursor-default select-none",
                        active ? "text-white font-semibold" : "text-yellow-400/80",
                      ].join(" ")}
                      title={cat}
                    >
                      {cat}
                    </span>
                  );
                })}
              </nav>
            )}
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="hover:underline">
                NEWSLETTER
              </a>
              <a href="#" className="hover:underline">
                SHIPPING POLICY
              </a>
              <a href="#" className="hover:underline">
                TERMS OF SERVICE
              </a>
            </div>
          </aside>

          {/* Konten utama */}
          <main className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT: image + thumbs (tanpa gradient frame) */}
            <div className="flex flex-col items-center">
              <div className="relative w-full flex items-center justify-center">
                <button
                  className="absolute left-0 text-2xl p-2 z-10"
                  onClick={handlePrev}
                  aria-label="Prev"
                  type="button"
                  disabled={!hasMany}
                  style={{ opacity: hasMany ? 1 : 0.3 }}
                >
                  <ChevronLeft />
                </button>

                {currentSrc ? (
                  <div className="w-full max-w-md rounded-2xl border border-yellow-400/20 bg-neutral-950">
                    <img
                      ref={imgRef}
                      src={toPublicUrl(currentSrc)} // FIXED
                      alt={product.name || "Product image"}
                      className="w-full h-auto rounded-2xl object-cover"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-md aspect-square grid place-items-center bg-neutral-900 text-yellow-400/60 rounded-2xl border border-yellow-400/20">
                    No image
                  </div>
                )}

                <button
                  className="absolute right-0 text-2xl p-2 z-10"
                  onClick={handleNext}
                  aria-label="Next"
                  type="button"
                  disabled={!hasMany}
                  style={{ opacity: hasMany ? 1 : 0.3 }}
                >
                  <ChevronRight />
                </button>
              </div>

              {images.length > 1 && (
                <div
                  className="mt-3 sm:mt-4 flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar w-full justify-center md:justify-start"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {images.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => {
                        setActiveIdx(idx);
                        logImageView(idx, img);
                      }}
                      className={`shrink-0 border-2 rounded ${idx === activeIdx ? "border-yellow-400" : "border-transparent"} focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      aria-label={`Thumbnail ${idx + 1}`}
                      title={`Thumbnail ${idx + 1}`}
                    >
                      <img src={toPublicUrl(img)} alt={`Thumbnail ${idx + 1}`} className="w-20 h-20 object-cover rounded" draggable={false} /> {/* FIXED */}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: info */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
                {product.category && product.category.trim().length > 0 && (
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full border border-yellow-400/40 bg-transparent px-2.5 py-1 text-xs font-semibold tracking-wide text-yellow-300">
                      {product.category}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xl">{displayPrice}</p>

              <div className="flex flex-wrap gap-2">
                {normalizedSizes.length === 0 ? (
                  <span className="text-sm text-yellow-300/70">Ukuran belum diisi.</span>
                ) : (
                  normalizedSizes.map((s, idx) => {
                    const disabled = (s.stock ?? 0) <= 0;
                    const active = idx === selectedSizeIdx;
                    return (
                      <button
                        key={`${s.label}-${idx}`}
                        onClick={() => {
                          if (!disabled) {
                            setSelectedSizeIdx(idx);
                            logMetricsEvent({
                              type: "SIZE_SELECTED",
                              productId: product.id,
                              sizeLabel: s.label,
                              metadata: { inStock: s.stock > 0, price: s.price ?? product.price },
                            });
                          }
                        }}
                        disabled={disabled}
                        className={[
                          "relative w-14 h-14 border-2 font-bold transition-colors duration-200 rounded",
                          active ? "bg-yellow-400 text-black border-yellow-400" : "text-yellow-400 hover:bg-yellow-400/20 border-yellow-400",
                          disabled ? "opacity-40 cursor-not-allowed" : "",
                        ].join(" ")}
                        title={disabled ? "Sold out" : s.label}
                      >
                        {s.label}
                        {disabled && (
                          <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white px-1 rounded">OUT</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <button
                className="w-full max-w-xs border-2 border-red-500 text-red-500 py-3 font-bold hover:bg-red-500 hover:text-black transition-colors duration-200 disabled:opacity-50 rounded-xl"
                onClick={handleAddToCart}
                disabled={!selectedInStock}
                title={!selectedInStock ? "Ukuran habis" : "Tambah ke keranjang"}
              >
                {selectedInStock ? "ADD TO CART" : "SOLD OUT"}
              </button>

              <div className="bg-neutral-900 text-white rounded px-4 py-3 text-sm whitespace-pre-line border-l-4 border-yellow-400 mt-3">
                {product.productDetail || <span className="italic text-gray-400">Tidak ada deskripsi produk.</span>}
              </div>
            </div>
          </main>
        </div>

        <footer className="text-center text-xs text-yellow-400/70 pt-8 mt-8 border-t border-yellow-400/50">
          <p>Copyright © 2023, CRTZW</p>
        </footer>
      </div>

      {/* Utility: sembunyikan scrollbar horizontal thumbnail */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

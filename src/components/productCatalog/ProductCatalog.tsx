"use client";
import React, { useMemo, useState, useCallback, memo, useEffect } from "react";
import SidebarCategoryLogo from "../sidebar/SidebarCategoryLogo";
import Marquee from "../marqueeBanner/Marquee";
import MobileMenuProduct from "./MobileMenuProduct";
import Header from "../header/Header";
import AdminActionButtons from "./components/AdminActionButtons";
import AccessCodeBox from "./components/AccessCodeBox";

type ProductItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  sizes: string[];
  isHidden: boolean;
  images: string[];
};

const PAGE_SIZE = 25;
const GROUP_TITLE_MAX = 35;
const TOTAL_PRODUCTS = 1000;
const STATIC_IMAGE = "/assets/images/rabu.jpg";
const PLACEHOLDER_THUMBNAIL = "/placeholder-thumb.png";
const LOCALSTORAGE_KEY_PAGE = "fourteen-last-page";
const LOCALSTORAGE_KEY_DATA = "fourteen-last-data";

// =====================
// HELPERS
// =====================
const truncate = (text: string, max: number) =>
  text.length > max ? text.slice(0, max - 1) + "…" : text;

// Dummy fetch data per page
function getProductsByPage(page: number, pageSize: number): ProductItem[] {
  const result: ProductItem[] = [];
  for (let idx = 0; idx < pageSize; idx++) {
    const globalIdx = (page - 1) * pageSize + idx;
    if (globalIdx >= TOTAL_PRODUCTS) break;
    result.push({
      id: globalIdx + 1,
      title: `STREET ITEM ${globalIdx + 1}`,
      description: "Streetwear vibes, ready to flex everywhere.",
      category: [
        "Artikel Bulan Juni yang panjang banget sampai dipotong",
        "Drop Juli",
        "Essentials",
        "Daily Style",
      ][globalIdx % 4],
      price: 99000 + (globalIdx % 7) * 45000,
      sizes: ["S", "M", "L", "XL"],
      isHidden: false,
      images: [STATIC_IMAGE],
    });
  }
  return result;
}

// =====================
// IMG WITH THUMB LOADING
// =====================
const CardImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full aspect-square rounded-xl mb-2 md:mb-3 bg-neutral-900 overflow-hidden">
      {!loaded && (
        <img
          src={PLACEHOLDER_THUMBNAIL}
          alt="thumbnail"
          className="absolute inset-0 w-full h-full object-cover rounded-xl transition-opacity duration-300 opacity-80"
          draggable={false}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover rounded-xl transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
};

const ShimmerCard: React.FC = () => (
  <div className="relative flex flex-col p-1 md:p-3 bg-white/5 border-0 md:border md:border-white/10 rounded-xl backdrop-blur-md animate-pulse overflow-hidden">
    <div className="w-full aspect-square rounded-xl mb-2 md:mb-3 bg-neutral-800 shimmer" />
    <div className="flex flex-col gap-1 px-1 md:px-0">
      <div className="h-4 bg-neutral-700 rounded w-2/3 mb-1 shimmer" />
      <div className="h-3 bg-neutral-800 rounded w-1/2 shimmer" />
    </div>
    <div className="mt-auto flex items-center justify-between pt-2 md:pt-3 border-t border-white/5">
      <div className="h-4 w-14 bg-neutral-700 rounded shimmer" />
      <div className="h-6 w-16 bg-neutral-900 rounded-full shimmer" />
    </div>
    <div className="absolute left-2 top-2 w-5 h-0.5 bg-white/10 rounded-full"></div>
  </div>
);
ShimmerCard.displayName = "ShimmerCard";

const ProductCard = memo(function ProductCard({ product }: { product: ProductItem }) {
  return (
    <div className="relative flex flex-col p-1 md:p-3 bg-white/5 border-0 md:border md:border-white/10 rounded-xl backdrop-blur-md">
      <CardImage src={product.images[0]} alt={product.title} />
      <div className="flex flex-col gap-0.5 md:gap-1 px-1 md:px-0">
        <div className="uppercase text-white font-extrabold text-xs md:text-sm tracking-widest">{product.title}</div>
        <div className="text-neutral-400 text-[11px] md:text-xs mb-1 md:mb-2 tracking-wide">{product.description}</div>
      </div>
      <div className="mt-auto flex items-center justify-between pt-2 md:pt-3 border-t border-white/5">
        <div className="text-white font-bold text-sm md:text-base tracking-wide opacity-80">
          Rp {product.price.toLocaleString()}
        </div>
        <button className="ml-1 md:ml-2 px-3 py-1 rounded-full border border-white/20 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/5 hover:bg-white/15 transition-all duration-150">
          Lihat
        </button>
      </div>
      <div className="absolute left-2 top-2 w-5 h-0.5 bg-white/20 rounded-full"></div>
    </div>
  );
});

const ProductGroupGrid: React.FC<{ products: ProductItem[]; loading: boolean }> = memo(({ products, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-9">
        <div>
          <div className="mb-3 text-lg md:text-xl font-black tracking-wider uppercase text-white/30 shimmer">Loading…</div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <ShimmerCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }
  const groupedList = useMemo(() => {
    const groupMap = new Map<string, ProductItem[]>();
    for (const p of products) {
      const key = p.category || "Tanpa Kategori";
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(p);
    }
    return Array.from(groupMap.entries()).map(([group, items]) => ({ group, items }));
  }, [products]);

  return (
    <div className="flex flex-col gap-9">
      {groupedList.map(({ group, items }) => (
        <div key={group}>
          <div className="mb-3 text-lg md:text-xl font-black tracking-wider uppercase text-white/90">
            {truncate(group, GROUP_TITLE_MAX)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
ProductGroupGrid.displayName = "ProductGroupGrid";

// =====================
// MAIN PAGE
// =====================
const FourteenProduct: React.FC = () => {
  const [page, setPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(LOCALSTORAGE_KEY_PAGE);
      return stored ? Number(stored) : 1;
    }
    return 1;
  });

  const [pageData, setPageData] = useState<ProductItem[]>(() => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(LOCALSTORAGE_KEY_DATA);
      return raw ? JSON.parse(raw) : [];
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const totalPages = useMemo(() => Math.ceil(TOTAL_PRODUCTS / PAGE_SIZE), []);

  const loadPage = useCallback((targetPage: number, prefetchNext = true) => {
    setLoading(true);
    setTimeout(() => {
      const data = getProductsByPage(targetPage, PAGE_SIZE);
      setPageData(data);
      setPage(targetPage);

      try {
        window.localStorage.setItem(LOCALSTORAGE_KEY_PAGE, String(targetPage));
        window.localStorage.setItem(LOCALSTORAGE_KEY_DATA, JSON.stringify(data));
      } catch {}

      setLoading(false);

      // Prefetch next page
      if (prefetchNext && targetPage < totalPages) {
        getProductsByPage(targetPage + 1, PAGE_SIZE);
      }
    }, 400);
  }, [totalPages]);

  useEffect(() => {
    if (pageData.length === 0) {
      loadPage(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrev = useCallback(() => {
    if (page > 1) loadPage(page - 1);
  }, [page, loadPage]);

  const handleNext = useCallback(() => {
    if (page < totalPages) loadPage(page + 1);
  }, [page, totalPages, loadPage]);

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <Header onSearch={() => {}} />
      <Marquee />
      <MobileMenuProduct isOpen={false} onClose={() => {}} />

      <div className="container mx-auto px-2 sm:px-8 pt-0 pb-14">
        <div className="flex flex-row gap-7 items-start mt-8 pt-0">
          <aside className="w-1/6 pr-4 hidden md:flex flex-col items-center pt-0 mt-0 sticky top-28">
            <SidebarCategoryLogo />
          </aside>
          <main className="w-full md:w-5/6">
            <AdminActionButtons isAdmin={false} onPostProduct={() => {}} onManageAccessCodes={() => {}} />
            <AccessCodeBox onVerified={() => {}} />

            {/* FILTER BUTTONS */}
            <div className="mb-6 mt-1 flex items-center">
              <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
                {["All", "T-Shirt", "Cap", "Hoodie", "Shorts"].map((cat) => (
                  <button
                    key={cat}
                    className="uppercase px-3 py-1 rounded-full font-bold border border-white/20 bg-transparent text-xs sm:text-sm text-white tracking-widest hover:bg-white/10 hover:text-black hover:border-white transition-all duration-150 whitespace-nowrap"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="w-full min-h-[400px]">
              <ProductGroupGrid products={pageData} loading={loading} />
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                className="px-4 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold disabled:opacity-40"
                onClick={handlePrev}
                disabled={page === 1 || loading}
              >
                Prev
              </button>
              <span className="font-mono text-sm tracking-widest">
                Page {page} / {totalPages}
              </span>
              <button
                className="px-4 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold disabled:opacity-40"
                onClick={handleNext}
                disabled={page === totalPages || loading}
              >
                Next
              </button>
            </div>
          </main>
        </div>
      </div>

{/* FOOTER */}
{/* FOOTER */}
<footer className="w-full py-6 border-t border-white/10 text-center">
  <p className="text-sm text-neutral-400 tracking-widest font-mono ml-8">
    © {new Date().getFullYear()}{" "}
    <span className="text-yellow-400 font-bold">Fourteendency</span>. All Rights Reserved.
  </p>
</footer>





      {/* SHIMMER EFFECT */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.12) 50%,transparent 100%);
          transform: translateX(-100%);
          animation: shimmer-move 1.5s infinite;
        }
        @keyframes shimmer-move {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

FourteenProduct.displayName = "FourteenProduct";
export default FourteenProduct;

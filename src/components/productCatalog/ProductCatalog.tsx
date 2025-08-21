// src/components/product/FourteenProduct.tsx
"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import SidebarCategoryLogo from "../sidebar/SidebarCategoryLogo";
import Marquee from "../marqueeBanner/Marquee";
import MobileMenuProduct from "./MobileMenuProduct";
import Header from "../header/Header";
import DetailProduct from "./DetailPorduct";

import useAdminGuard from "./hooks/useAdminGuard";
import { buildImages, getPriceStr } from "./components/utils";
import AdminActionButtons from "./components/AdminActionButtons";

import ProductGrid from "./components/ProductGrid";
import { ProductItem } from "./components/types";
import usePublicProducts from "./hooks/usePublicProducts";
import AccessCodeBox from "./components/AccessCodeBox";


const FourteenProduct: React.FC = () => {
  const router = useRouter();

  const isAdmin = useAdminGuard();
  const { products, setProducts } = usePublicProducts();

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

  // ===== akses (ditentukan oleh cookie di server) =====
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  // cek status akses dari server
  const checkAccess = useCallback(async () => {
    try {
      const res = await fetch("/api/access/status", { credentials: "include", cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) setHasAccess(!!data.hasAccess);
      else setHasAccess(false);
    } catch {
      setHasAccess(false);
    }
  }, []);

  // helper fetch list (hanya includeHidden bila hasAccess)
  const fetchProducts = useCallback(
    async (forceIncludeHidden?: boolean) => {
      const includeHidden = forceIncludeHidden ?? hasAccess;
      const url = includeHidden ? "/api/user/products?includeHidden=1" : "/api/user/products";
      try {
        const res = await fetch(url, { method: "GET", credentials: "include", cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.ok && Array.isArray(data.items)) {
          setProducts(data.items as ProductItem[]);
        }
      } catch {
        // ignore
      }
    },
    [hasAccess, setProducts]
  );

  // initial load: cek akses dulu, lalu fetch sesuai akses
  useEffect(() => {
    (async () => {
      await checkAccess();
      await fetchProducts(); // akan pakai nilai hasAccess terbaru (state sudah di-set di atas)
    })();
  }, [checkAccess, fetchProducts]);

  // ketika AccessCodeBox sukses verifikasi → set hasAccess dan refetch dengan includeHidden
  const handleAccessVerified = useCallback(async () => {
    setHasAccess(true);
    await fetchProducts(true); // paksa includeHidden
  }, [fetchProducts]);

  // ---- DELETE HANDLER (ADMIN ONLY) ----
  const handleDelete = async (id: number) => {
    if (!id) return alert("Produk tidak punya ID yang valid.");
    if (!confirm("Yakin hapus produk ini?")) return;

    try {
      setBusyIds((prev) => new Set(prev).add(id));
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || "Gagal menghapus produk");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      alert(e?.message || "Gagal menghapus produk");
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // ---- HIDE HANDLER (ADMIN ONLY) ----
  const handleHide = async (id: number) => {
    if (!id) return alert("Produk tidak punya ID yang valid.");
    if (!confirm("Sembunyikan produk ini?")) return;

    try {
      setBusyIds((prev) => new Set(prev).add(id));
      const res = await fetch(`/api/admin/products/hide?id=${id}`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || "Gagal menyembunyikan produk");
      }

      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isHidden: true } : p)));
    } catch (e: any) {
      alert(e?.message || "Gagal menyembunyikan produk");
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // ---- SEARCH HANDLER ----
  const handleSearch = useCallback(
    (query: string) => {
      const q = query ?? "";
      setSearchQuery(q);
      if (q.trim() === "") {
        fetchProducts(); // refresh sesuai akses saat ini
      }
    },
    [fetchProducts]
  );

  // daftar kategori dari produk (tanpa saring hidden di FE — server sudah gating)
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      const c = (p.category || "").trim();
      if (c) set.add(c);
    }
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  // filter gabungan (tanpa saring hidden di FE)
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat =
        !selectedCategory || selectedCategory === "All" || (p.category || "").trim() === selectedCategory;

      const nameForSearch = (p as any).productName
        ? String((p as any).productName).toLowerCase()
        : String(p.title || "").toLowerCase();

      const descForSearch = String(p.description || "").toLowerCase();
      const titleForSearch = String(p.title || "").toLowerCase();

      const matchSearch =
        q === "" ||
        nameForSearch.includes(q) ||
        titleForSearch.includes(q) ||
        descForSearch.includes(q);

      return matchCat && matchSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  // === DETAIL VIEW ===
  if (selectedProduct) {
    const imgs = buildImages(selectedProduct);
    return (
      <DetailProduct
        product={{
          id: selectedProduct.id,
          name: (selectedProduct as any).productName || selectedProduct.title,
          price: getPriceStr(selectedProduct),
          images: imgs,
          productDetail: selectedProduct.description || "",
          sizes: selectedProduct.sizes,
          category: selectedProduct.category ?? null,
        }}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  // === LIST VIEW ===
  return (
    <div className="bg-black min-h-screen text-gray-300 font-mono">
      <Header onSearch={handleSearch} />
      <Marquee />
      <MobileMenuProduct isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="container mx-auto px-4 sm:px-8 pt-0 pb-8">
        <div className="flex flex-row gap-12 items-start mt-8 pt-0">
          <aside className="w-1/6 pr-4 hidden md:flex flex-col items-center pt-0 mt-0 sticky top-28">
            <SidebarCategoryLogo />
          </aside>

          <main className="w-full md:w-5/6">
            <AdminActionButtons
              isAdmin={isAdmin}
              onPostProduct={() => router.push("/admins/upload")}
              onManageAccessCodes={() => router.push("/admins/access-codes")}
            />

            {/* Setelah verifikasi → set hasAccess dan refetch dengan includeHidden */}
            <AccessCodeBox onVerified={handleAccessVerified} />

            {/* Filter kategori */}
            {categories.length > 1 && (
              <div className="mb-6 -mt-2">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map((cat) => {
                    const active = (selectedCategory ?? "All") === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat === "All" ? null : cat)}
                        className={[
                          "whitespace-nowrap px-3 py-1 rounded border text-sm transition-colors",
                          active
                            ? "bg-yellow-400 text-black border-yellow-400"
                            : "bg-white/5 text-gray-200 border-yellow-400/30 hover:bg-white/10",
                        ].join(" ")}
                        title={cat}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                {(selectedCategory || searchQuery) && (
                  <div className="mt-2 text-xs text-gray-400">
                    {selectedCategory && (
                      <span className="mr-3">
                        Kategori: <span className="text-yellow-300">{selectedCategory}</span>
                      </span>
                    )}
                    {searchQuery && (
                      <span>
                        Cari: <span className="text-yellow-300">{searchQuery}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Grid */}
            <ProductGrid
              products={filtered}
              onSelect={setSelectedProduct}
              isAdmin={isAdmin}
              onDelete={(id: number) => handleDelete(id)}
              onHide={(id: number) => handleHide(id)}
              deletingIds={busyIds}
            />
          </main>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(-6px);} 100% { opacity: 1; transform: none;} }
        .animate-fadeIn { animation: fadeIn 0.15s linear; }
      `}</style>
    </div>
  );
};

export default FourteenProduct;

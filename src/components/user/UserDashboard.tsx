"use client";
import React, { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import UserHeader from "./header/UserHeader";
import UserSearch from "@/components/user/search/UserSearch";
import CategoryCard from "./category/CategoryCard";
const UserFloatingCart = React.lazy(() => import("@/components/user/cart/UserFloatingCart"));
const UserProductItem = React.lazy(() =>
  import("./product/UserProductList").then((m) => ({ default: m.UserProductItem }))
);
import UserPagination from "./product/UserPagination";
import { useUserLoggoutStore } from "@/store/user/auth/useUserLoggoutStore";
import { useUserProduct } from "@/store/user/product/useUserProduct";
import { UserProduct } from "@/store/type/types";
import { useUserUnlockProduct } from "@/store/user/product/useUserUnclockProduct";

export default function UserDashboard() {
  // --- UNLOCK CODE STATE ---
const {
  codes: unlockedCodes,   // GANTI DARI "code: unlockedCode"
  loading: unlockLoading,
  error: unlockError,
  success: unlockSuccess,
  unlockProduct,
  reset: resetUnlock,
} = useUserUnlockProduct();


  // SSR PATCH
const [inputCode, setInputCode] = useState("");
useEffect(() => {
  setInputCode(
    unlockedCodes.length
      ? unlockedCodes[unlockedCodes.length - 1]
      : (typeof window !== "undefined"
        ? (JSON.parse(localStorage.getItem("user_unlock_code") || "[]")[0] ?? "")
        : "")
  );
}, [unlockedCodes]);
;

  // --- PRODUCT, SEARCH, ETC ---
  const { error: logoutError, isSuccess, resetLogoutState } = useUserLoggoutStore();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingUuid, setLoadingUuid] = useState<string | number | null>(null);

  const { products, error: productError, fetchProducts } = useUserProduct();

  // --- EFFECTS ---
  useEffect(() => {
    resetLogoutState();
    fetchProducts();
  }, [resetLogoutState, fetchProducts]);

  // Refetch produk setelah sukses unlock
  useEffect(() => {
    if (unlockSuccess) {
      fetchProducts();
      setTimeout(() => {
        resetUnlock();
      }, 2000);
    }
  }, [unlockSuccess, fetchProducts, resetUnlock]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => router.push("/user/auth/login"), 800);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  useEffect(() => {
    if (productError === "unauthorized") {
      router.replace("/user/auth/login");
    }
  }, [productError, router]);

  // --- FILTERING ---
  const filtered = useMemo(() => {
    let result = products as UserProduct[];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.name.toLowerCase().includes(query)
      );
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category_name === selectedCategory);
    }
    return result;
  }, [products, searchQuery, selectedCategory]);

  const ITEMS_PER_PAGE = 25;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  );

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products.map((p: UserProduct) => p.category_name).filter(Boolean)
      )
    );
  }, [products]);

  const groupedProducts = useMemo(() => {
    return Object.entries(
      paginated.reduce((acc: Record<string, UserProduct[]>, p) => {
        (acc[p.title] ||= []).push(p);
        return acc;
      }, {})
    );
  }, [paginated]);

  const handleClickProduct = useCallback(
    (uuid: string, isLocked?: boolean) => {
      if (isLocked) return; // Jangan bisa klik kalau locked
      setLoadingUuid(uuid);
      setTimeout(() => {
        router.push(`/user/products/${uuid}`);
      }, 300);
    },
    [router]
  );

  // --- UNLOCK FORM LOGIC ---
  const handleUnlock = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (inputCode.trim() === "") return;
      await unlockProduct(inputCode.trim());
    },
    [inputCode, unlockProduct]
  );

  // ===== RENDER =====
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start px-6 py-12 text-white">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://nafaskarya-bucket.oss-ap-southeast-5.aliyuncs.com/images/admin-bg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0 backdrop-blur-3xl bg-white/5" />
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <UserHeader />
        </header>

        {/* === FORM UNLOCK PRODUK TERSEMBUNYI === */}
        <form onSubmit={handleUnlock} className="mb-4 flex items-center gap-2 w-full max-w-sm">
          <input
            type="text"
            className="rounded-lg px-3 py-2 bg-zinc-900 text-white border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 flex-1"
            placeholder="Masukkan Kode Produk Tersembunyi..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            disabled={unlockLoading}
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 active:scale-95 transition"
            disabled={unlockLoading || !inputCode.trim()}
          >
            {unlockLoading ? "Unlocking..." : "Unlock"}
          </button>
        </form>
        {unlockError && (
          <div className="mb-2 text-sm text-red-400 font-medium">{unlockError}</div>
        )}
        {unlockSuccess && (
          <div className="mb-2 text-sm text-green-400 font-medium">Produk hidden sudah kebuka! 🎉</div>
        )}

        {logoutError && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded text-sm text-left max-w-lg">
            {logoutError}
          </div>
        )}
        {isSuccess && (
          <div className="mb-4 bg-green-100 text-green-700 p-3 rounded text-sm text-left max-w-lg">
            Logout berhasil! Redirecting...
          </div>
        )}

        <UserSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        <section className="mt-12 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">Categories</h2>
          <CategoryCard categories={categories} />
        </section>

        <main>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 text-zinc-300 mt-20">
              <p className="italic text-base mt-2 text-zinc-400">
                Ain’t no products here, mate.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-12 mt-6">
              {groupedProducts.map(([title, group]) => (
                <section key={title} className="flex flex-col gap-4">
                  <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white px-1">
                    {title}
                  </h2>
                  <ul className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    <Suspense fallback={<li>Loading products...</li>}>
                      {group.map((product, index) => (
                        <li key={product.uuid || product.id} className="flex flex-col">
                          <UserProductItem
                            product={product}
                            index={index}
                            isLocked={product.is_locked} // LANGSUNG AMBIL DARI BE
                            onClick={() => handleClickProduct(product.uuid, product.is_locked)}
                            isLoading={loadingUuid === product.uuid}
                            disabled={!!loadingUuid || product.is_locked}
                          />
                        </li>
                      ))}
                    </Suspense>
                  </ul>
                </section>
              ))}
            </div>
          )}

          {filtered.length > 0 && totalPages > 1 && (
            <UserPagination
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </main>
      </div>
      <Suspense fallback={null}>
        <UserFloatingCart />
      </Suspense>
    </div>
  );
}

"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";
import { Upload, Loader2, PackageOpen } from "lucide-react";

import AdminSearch from "@/components/admin/search/AdminSearch";
import ProductList from "./product/ProductList";
import Pagination from "./product/Pagination";
import AdminHeader from "./header/AdminHeader";
import CategoryCard from "./upload/category/CategoryCard";
import { useAdminProductStore } from "@/store/admin/product/useAdminProductStore";
import AccessCodeBox from "./accessCd/AccessCodeBox";

// --- Tambahkan ini ---

// ----------------------

const BACKGROUND_IMAGES = [
  "https://nafaskarya-bucket.oss-ap-southeast-5.aliyuncs.com/images/admin-bg.png",
  "https://nafaskarya-bucket.oss-ap-southeast-5.aliyuncs.com/images/admin-bg2.png",
  "https://nafaskarya-bucket.oss-ap-southeast-5.aliyuncs.com/images/admin-bg3.png",
  "https://nafaskarya-bucket.oss-ap-southeast-5.aliyuncs.com/images/admin-bg.png",
];

const ITEMS_PER_PAGE = 25;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Admin!";
  if (hour < 18) return "Good afternoon, Admin!";
  return "Good evening, Admin!";
};

const formatWIB = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 7 * 60 * 60000);
  return wibTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

function getUnlockedCodes() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("unlockedHiddenCodes") || "[]");
  } catch {
    return [];
  }
}
function saveUnlockedCodes(arr: string[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("unlockedHiddenCodes", JSON.stringify(arr));
  }
}

const DashboardSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2 animate-pulse">
        <div className="w-full h-72 bg-zinc-800/40 rounded-xl" />
        <div className="h-4 w-1/2 bg-zinc-700/40 rounded" />
        <div className="h-3 w-1/3 bg-zinc-700/30 rounded" />
      </div>
    ))}
  </div>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [timeWIB, setTimeWIB] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);

  // Array kode yg pernah berhasil
  const [unlockedHiddenCodes, setUnlockedHiddenCodes] = useState<string[]>([]);
  const [hiddenCodeInput, setHiddenCodeInput] = useState(""); // input only

  const {
    getAdminProducts,
    products,
    loading,
    error,
    getCategoriesFromProducts,
    categories,
  } = useAdminProductStore();

  const handleGoToUpload = useCallback(() => {
    setUploadLoading(true);
    router.push("/admins/upload");
  }, [router]);

  // Load unlocked code list from localStorage
  useEffect(() => {
    setUnlockedHiddenCodes(getUnlockedCodes());
  }, []);

  // Ambil produk (nggak perlu kirim kode, FE yang handle blur)
  useEffect(() => {
    getAdminProducts(searchQuery, selectedCategory,);
    getCategoriesFromProducts();
    setGreeting(getGreeting());
    const randomPick =
      BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
    setBgImage(randomPick);

    setTimeWIB(formatWIB());
    const interval = setInterval(() => setTimeWIB(formatWIB()), 1000);
    return () => clearInterval(interval);
  }, [getAdminProducts, getCategoriesFromProducts, searchQuery, selectedCategory]);

  // === CONSOLE LOG: Liat data raw dari API ===
  useEffect(() => {
    if (products.length > 0) {
      console.log("=== RAW PRODUCTS DARI API ===");
      console.table(products); // Liat bentuk tabel
    }
  }, [products]);

  // === NO FILTER: SEMUA PRODUK KELUAR, FILTER SEARCH/KATEGORI DOANG ===
  const showProducts = useMemo(() => {
    return products.filter((p) => {
      const isNameMatch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const isCategoryMatch =
        selectedCategory === "" ||
        (p.category_name || "").toLowerCase() === selectedCategory.toLowerCase();
      return isNameMatch && isCategoryMatch;
    });
  }, [products, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(showProducts.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = showProducts.slice(start, start + ITEMS_PER_PAGE);

  // ======= UNLOCK HANDLER
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const code = hiddenCodeInput.trim();
    if (!code) return;

    // Cek ada nggak produk dengan kode hidden_code = code
    const found = products.find(
      (p) => p.hidden_code && String(p.hidden_code).trim() === code
    );
    if (found) {
      // Kalau belum ada di array, masukin!
      if (!unlockedHiddenCodes.includes(code)) {
        const updated = [...unlockedHiddenCodes, code];
        setUnlockedHiddenCodes(updated);
        saveUnlockedCodes(updated);
      }
      setHiddenCodeInput(""); // clear input
    } else {
      // Kasih feedback kalau nggak ada (bisa toast/alert)
      alert("Kode tidak ditemukan atau tidak valid!");
    }
  };

  // Optional: buat tombol reset unlock
  const handleResetUnlocks = () => {
    setUnlockedHiddenCodes([]);
    saveUnlockedCodes([]);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start px-6 py-12 text-white">
      {/* Background */}
      {bgImage && (
        <div className="absolute inset-0 -z-10">
          <img
            src={bgImage}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/80" />
          <div className="absolute inset-0 backdrop-blur-3xl bg-white/5" />
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
        </div>
      )}

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <AdminHeader greeting={greeting} timeWIB={timeWIB} />
          <div>
            <button
              type="button"
              onClick={handleGoToUpload}
              disabled={uploadLoading}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold uppercase tracking-widest text-sm border border-white/30 hover:bg-white/10 active:scale-95 transition ${
                uploadLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Upload Product
                </>
              )}
            </button>
          </div>
        </header>

        {/* Access Code Tools */}
        <AccessCodeBox />

        {/* Hidden Code Input + Reset */}
        <form className="flex items-center gap-2 mb-6" onSubmit={handleUnlock}>
          <input
            type="text"
            placeholder="Masukkan Hidden Code.."
            value={hiddenCodeInput}
            onChange={(e) => setHiddenCodeInput(e.target.value)}
            className="rounded-lg px-3 py-2 bg-zinc-900 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg font-semibold text-xs bg-yellow-500 text-black"
          >
            Unlock
          </button>
          {/* <button
            type="button"
            onClick={handleResetUnlocks}
            className="px-3 py-2 rounded-lg text-xs bg-zinc-700 text-white"
          >
            Reset
          </button> */}
        </form>

        <AdminSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        {/* === SECTION KATEGORI === */}
        <section className="mt-12 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">Categories</h2>
          {categories.length > 0 ? (
            <CategoryCard categories={categories} />
          ) : (
            <p>No categories available.</p>
          )}
        </section>

        {/* Products */}
        <main>
          {loading && <DashboardSkeleton />}
          {error && (
            <p className="text-center text-red-400 font-semibold">
              Error: {error}
            </p>
          )}
          {!loading && !error && showProducts.length === 0 && (
            <div className="flex flex-col items-center gap-2 text-zinc-300 mt-20">
              <PackageOpen className="h-12 w-12 opacity-60" />
              <p className="italic">No products found.</p>
            </div>
          )}
          {!loading && !error && (
            <>
              <ProductList
                products={paginatedProducts}
                unlockedHiddenCodes={unlockedHiddenCodes}
              />
              {totalPages > 1 && (
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

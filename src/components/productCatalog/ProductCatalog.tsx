"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SidebarCategoryLogo from "../sidebar/SidebarCategoryLogo";
import Marquee from "../marqueeBanner/Marquee";
import { getCurrentUser } from "@/logic/authLocal";
import AdminImageCardProduct from "./AdminImageCardProduct";
import MobileMenuProduct from "./MobileMenuProduct";
import Header from "../header/Header"; // --- PASTIKAN IMPORT HEADER VERSI BARU

import {
  ProductImage,
  getAvailableProductImages,
  getAllProductTitles,
  searchProductImages,    // <--- IMPORT FUNGSI SEARCH BARU
} from "@/logic/productLogic";
import {
  groupByTitle,
  handleDeleteProduct,
  handleTitleClickProduct,
  submitRenameTitleProduct
} from "@/models/productLogicLocal";
import DetailProduct from "./DetailPorduct";

const FourteenProduct = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [allTitles, setAllTitles] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [useManualTitle, setUseManualTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState<string>("");

  const currentUser = getCurrentUser();

  // --- Detail ---
  const [selectedProduct, setSelectedProduct] = useState<ProductImage | null>(null);

  // --- State produk (search result) ---
  const [filteredProducts, setFilteredProducts] = useState<ProductImage[]>([]);

  // Fetch initial product list
  useEffect(() => {
    const data = getAvailableProductImages(currentUser?.role) as ProductImage[];
    setFilteredProducts(data);
  }, [currentUser?.role]);

  // Fetch all titles (optional, kalau mau dipakai buat filter by title)
  useEffect(() => {
    setAllTitles(getAllProductTitles());
  }, [filteredProducts]);

  // Search logic (biar search live)
  const handleSearch = useCallback((query: string) => {
    // Pake logic pencarian custom
    let products: ProductImage[] = [];
    if (query.trim() === "") {
      // Tampilkan semua kalau query kosong
      products = getAvailableProductImages(currentUser?.role) as ProductImage[];
    } else {
      products = searchProductImages(query);
    }
    setFilteredProducts(products);
  }, [currentUser?.role]);

  // Kelompokkan produk by title (category) -- hasil search, bukan semua
  const groupedProducts = groupByTitle(filteredProducts);

  // --- Render detail jika ada yang dipilih ---
  if (selectedProduct) {
    return (
      <DetailProduct
        product={{
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          imageUrl: selectedProduct.frontImage
        }}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  return (
    <div className="bg-black min-h-screen text-gray-300 font-mono">
      {/* HEADER + SEARCH */}
      <Header onSearch={handleSearch} />

      <Marquee />
      <MobileMenuProduct isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="container mx-auto px-4 sm:px-8 pt-0 pb-8">
        <div className="flex flex-row gap-12 items-start mt-8 pt-0">
          <aside className="w-1/6 pr-4 hidden md:flex flex-col items-center pt-0 mt-0 sticky top-28">
            <SidebarCategoryLogo />
          </aside>
          <main className="w-full md:w-5/6">
            {/* ADMIN POST PRODUCT BUTTON */}
            {currentUser?.role === "admin" && (
              <div className="mb-10">
                <button
                  className="px-5 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300 active:scale-95 transition-all"
                  onClick={() => {
                    router.push("/admins/upload");
                  }}
                >
                  Post Product
                </button>
              </div>
            )}

            {/* DAFTAR PRODUK (GROUPED BY TITLE, FILTERED) */}
            {Object.entries(groupedProducts).length === 0 ? (
              <p className="text-gray-500 italic">Belum ada produk yang cocok</p>
            ) : (
              Object.entries(groupedProducts).map(([title, products]) => (
                <div key={title} className="mb-10">
                  {/* TITLE BISA DI-RENAME */}
                  {editingTitle === title && currentUser?.role === "admin" ? (
                    <input
                      type="text"
                      value={titleInput}
                      autoFocus
                      onChange={e => setTitleInput(e.target.value)}
                      onBlur={() =>
                        submitRenameTitleProduct({
                          editingTitle, titleInput, setEditingTitle, setFilteredProducts, currentUser
                        })
                      }
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === "Escape") {
                          submitRenameTitleProduct({
                            editingTitle, titleInput, setEditingTitle, setFilteredProducts, currentUser
                          });
                        }
                      }}
                      className="text-xl font-bold text-yellow-400 mb-4 mt-8 bg-neutral-900 px-2 py-1 rounded outline-none border border-yellow-300"
                      style={{ minWidth: 100 }}
                    />
                  ) : (
                    <h3
                      className={`text-xl font-bold text-yellow-400 mb-4 mt-8 cursor-pointer hover:underline ${currentUser?.role === "admin" ? "" : "pointer-events-none"}`}
                      tabIndex={currentUser?.role === "admin" ? 0 : -1}
                      onClick={() =>
                        handleTitleClickProduct(title, currentUser, setEditingTitle, setTitleInput)
                      }
                      onKeyDown={e => {
                        if (e.key === "Enter")
                          handleTitleClickProduct(title, currentUser, setEditingTitle, setTitleInput);
                      }}
                    >
                      {title}
                    </h3>
                  )}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
                    {products.map((img: any) => (
                      <AdminImageCardProduct
                        key={img.id}
                        {...img}
                        isAdmin={currentUser?.role === "admin"}
                        onDelete={
                          currentUser?.role === "admin"
                            ? () => handleDeleteProduct(img.id, currentUser, setFilteredProducts)
                            : undefined
                        }
                        // === Tambah onClick: buka detail ===
                        onClick={() => setSelectedProduct(img)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default FourteenProduct;

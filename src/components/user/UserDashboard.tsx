"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import UserHeader from "./header/UserHeader";
import UserSearch from "@/components/user/search/UserSearch";
import CategoryCard from "./category/CategoryCard";
import UserProductList, { UserProductItem } from "./product/UserProductList";
import UserPagination from "./product/UserPagination";
import { useUserLoggoutStore } from "@/store/user/auth/useUserLoggoutStore";
import { useUserProduct } from "@/store/user/product/useUserProduct";

// Import floating cart reusable
import UserFloatingCart from "@/components/user/cart/UserFloatingCart";

export default function UserDashboard() {
  const { error: logoutError, isSuccess, resetLogoutState } = useUserLoggoutStore();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingUuid, setLoadingUuid] = useState<string | number | null>(null);

  const { products, error: productError, fetchProducts } = useUserProduct();

  useEffect(() => {
    resetLogoutState();
    fetchProducts();
  }, [resetLogoutState, fetchProducts]);

  const categories = useMemo(() => {
    const names = products.map((p: any) => p.category_name).filter(Boolean);
    return Array.from(new Set(names));
  }, [products]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/user/auth/login");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  useEffect(() => {
    if (productError === "unauthorized") {
      router.replace("/user/auth/login");
    }
  }, [productError, router]);

  const handleClickProduct = useCallback(
    (uuid: string) => {
      setLoadingUuid(uuid);
      setTimeout(() => {
        router.push(`/user/products/${uuid}`);
      }, 300);
    },
    [router]
  );

  const groupedProducts = useMemo(() => {
    return Object.entries(
      products.reduce((acc: Record<string, any[]>, p: any) => {
        (acc[p.title] ||= []).push(p);
        return acc;
      }, {})
    );
  }, [products]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start px-6 py-12 text-white">
      {/* Background */}
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
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <UserHeader />
        </header>

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

        {/* Search */}
        <UserSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        {/* Categories */}
        <section className="mt-12 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">Categories</h2>
          <CategoryCard categories={categories} />
        </section>

        {/* Products */}
        <main>
          <div className="flex flex-col gap-12 mt-6">
            {groupedProducts.map(([title, group]) => (
              <section key={title} className="flex flex-col gap-4">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white px-1">
                  {title}
                </h2>
                <ul className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.map((product, index) => (
                    <li
                      key={product.uuid || product.id}
                      className="flex flex-col"
                    >
                      <UserProductItem
                        product={product}
                        index={index}
                        onClick={() => handleClickProduct(product.uuid)}
                        isLoading={loadingUuid === product.uuid}
                        disabled={!!loadingUuid}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <UserPagination
            totalPages={1}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </main>
      </div>

      {/* Floating Cart (modular, selalu ready!) */}
      <UserFloatingCart />
    </div>
  );
}

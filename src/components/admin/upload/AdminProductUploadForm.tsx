"use client";
import React, { useEffect, useState, useCallback } from "react";

import { Upload as UploadIcon } from "lucide-react";
import ProductMetaAndSizes from "./ProductMetaAndSizes";
import ProductMediaAndSubmit from "./ProductMediaAndSubmit";
import { ProductFormData, Product } from "@/store/type/types";
import { useRouter } from "next/navigation";
import { useAdminProductStore } from "@/store/admin/product/useAdminProductStore";
import { useEditProductStore } from "@/store/admin/product/useAdminEditProductStore";

type Props = {
  mode: "create" | "edit";
  initialData?: Product;
  onSubmit: (payload: any) => Promise<void>;
  uuid?: string;
  loading: boolean;
  error: string | null;
};

export default function AdminProductUploadForm({
  mode,
  initialData,
  onSubmit,
  uuid,
  loading,
  error,
}: Props) {
  const { storeProduct, loading: createLoading, error: createError, success: createSuccess } =
    useAdminProductStore();

  const {
    editProduct,
    loading: editLoading,
    error: editError,
    success: editSuccess,
  } = useEditProductStore();

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    name: "",
    description: "",
    expiredAt: "",
    sizes: [{ size: "", price: "", stock: "" }],
    frontImage: null,
    backImage: null,
    galleryImages: [],
    category_name: "",
  });

  // ===== Tambahan produk hidden =====
  const [hiddenCode, setHiddenCode] = useState(""); // manual kode hidden
  const [autoHiddenCode, setAutoHiddenCode] = useState(false); // auto random kode
  // =================================

  const router = useRouter();

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title,
        name: initialData.name,
        description: initialData.description,
        expiredAt: initialData.expired_at,
        sizes: initialData.sizes.map((s) => ({
          size: s.size,
          price: String(s.price),
          stock: String(s.stock),
        })),
        frontImage: null,
        backImage: null,
        galleryImages: [],
        category_name: initialData.category_name || "",
      });
      setHiddenCode(initialData.hidden_code || "");
      setAutoHiddenCode(false);
    }
  }, [mode, initialData]);

  const handleChange = useCallback(
    <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateSize = useCallback(
    (i: number, key: keyof ProductFormData["sizes"][0], value: string) => {
      setFormData((prev) => {
        const newSizes = [...prev.sizes];
        newSizes[i] = { ...newSizes[i], [key]: value };
        return { ...prev, sizes: newSizes };
      });
    },
    []
  );

  const handleGalleryChange = useCallback(
    (file: File | null) => {
      if (file) {
        handleChange("galleryImages", [...formData.galleryImages, file]);
      }
    },
    [formData.galleryImages, handleChange]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof onSubmit === "function") {
      const payload = {
        title: formData.title,
        name: formData.name,
        description: formData.description,
        expired_at: formData.expiredAt,
        sizes: formData.sizes.map((s) => ({
          ...s,
          price: String(s.price),
          stock: String(s.stock),
        })),
        front_image: formData.frontImage,
        back_image: formData.backImage,
        gallery_images: formData.galleryImages,
        category_name: formData.category_name,
        // ========== Tambahan hidden ==========
        hidden_code: hiddenCode.trim() ? hiddenCode.trim() : undefined,
        auto_hidden_code: autoHiddenCode ? true : undefined,
        // =====================================
      };

      try {
        await onSubmit(payload);

        const success = useAdminProductStore.getState().success;
        if (success) {
          router.push("/admins/dashboard");
        }
      } catch (err) {
        console.error("Error during product creation:", err);
      }
    } else {
      console.error("onSubmit is not a function");
    }
  };

  const createProductSuccess = mode === "create" ? createSuccess : editSuccess;
  const loadingState = mode === "edit" ? editLoading : createLoading;
  const errorState = mode === "edit" ? editError : createError;

  return (
    <div className="min-h-screen relative text-white overflow-x-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="/assets/images/admin-bg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-5 py-4 shadow">
            <h1 className="text-2xl sm:text-3xl font-black tracking-[0.2em] uppercase">
              Admin — {mode === "edit" ? "Edit Product" : "Upload Product"}
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-300/80 mt-1 tracking-widest uppercase">
              Streetwear Ops Panel · Glass / Minimal / Precise
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/15 px-3 py-1 text-[11px] tracking-widest uppercase shadow">
            <UploadIcon className="h-3.5 w-3.5" />
            {mode === "edit" ? "Update Drop" : "New Drop"}
          </span>
        </header>

        {createProductSuccess && (
          <div className="mb-4 rounded-lg bg-green-600/20 border border-green-600 px-4 py-3 text-sm text-green-300">
            {mode === "edit" ? "Produk berhasil diubah" : "Produk berhasil ditambahkan"}
          </div>
        )}
        {errorState && (
          <div className="mb-4 rounded-lg bg-red-600/20 border border-red-600 px-4 py-3 text-sm text-red-300">
            {errorState}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <ProductMetaAndSizes
              formData={formData}
              handleChange={handleChange}
              updateSize={updateSize}
              error={errorState}
              success={createProductSuccess}
            />
          </section>

          <aside className="space-y-6">
            {/* Category Input */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-zinc-300 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={formData.category_name || ""}
                onChange={(e) => handleChange("category_name", e.target.value)}
                placeholder="Enter category name"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-zinc-500"
              />
            </div>

            {/* Produk Hidden */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-yellow-400 mb-1">
                Hidden Code (optional)
              </label>
              <input
                type="text"
                value={hiddenCode}
                onChange={(e) => setHiddenCode(e.target.value)}
                placeholder="Masukkan kode produk hidden (atau kosongkan)"
                className="w-full bg-black/40 border border-yellow-400/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-zinc-500 mb-1"
              />
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  id="autoHiddenCode"
                  checked={autoHiddenCode}
                  onChange={() => setAutoHiddenCode((x) => !x)}
                  className="accent-yellow-400"
                />
                <label htmlFor="autoHiddenCode" className="text-zinc-400">
                  Random kode otomatis (abaikan input manual jika dicentang)
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Jika diisi, produk hanya bisa diakses pakai kode ini (atau random otomatis).
              </p>
            </div>

            <ProductMediaAndSubmit
              formData={formData}
              handleChange={handleChange}
              handleGalleryChange={handleGalleryChange}
              loading={loadingState}
            />
          </aside>
        </form>
      </div>
    </div>
  );
}

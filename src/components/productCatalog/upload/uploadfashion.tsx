"use client";
import React, { useState, useEffect } from "react";
import {
  formatHargaRp,
  uploadProductImage,
  getAllProductImages,
  calcTotalHargaProduk, // pastikan sudah di-export dari logic kamu
} from "@/logic/productLogic";
import CategoryDropdown from "./CategoryDropdown";

interface UploadFashionProps {
  useManualCategory: boolean;
  setUseManualCategory: (b: boolean) => void;
  category: string;
  setCategory: (t: string) => void;
  setAdminImages: (v: any) => void;
  currentUser: any;
  error: string | null;
  setError: (e: string | null) => void;
}

const UploadFashion: React.FC<UploadFashionProps> = ({
  useManualCategory,
  setUseManualCategory,
  category,
  setCategory,
  setAdminImages,
  currentUser,
  error,
  setError,
}) => {
  const [mounted, setMounted] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frontImage, setFrontImage] = useState<string>("");
  const [backImage, setBackImage] = useState<string>("");
  const [productDetail, setProductDetail] = useState("");
  const [discount, setDiscount] = useState("");
  const [voucher, setVoucher] = useState("");
  const [tax, setTax] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const products = getAllProductImages();
    const categories = Array.from(
      new Set(products.map((p) => (p.title?.trim() ? p.title.trim() : "Tanpa Kategori")))
    );
    setAllCategories(categories);
  }, []);

  // Ongkir (5% dari harga)
  const shipping = (() => {
    const n = Number(price.replace(/\D/g, ""));
    if (!isNaN(n) && n > 0) return Math.round(n * 0.05);
    return 0;
  })();

  // Harga total (otomatis update)
  const totalHarga = calcTotalHargaProduk({
    price,
    discount,
    voucher,
    tax,
    shipping,
  });

  function handleImageInput(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setter(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !price.trim() || !frontImage.trim() || !productDetail.trim()) {
      setError("Nama, harga, gambar depan, dan detail produk wajib diisi");
      return;
    }

    const result = uploadProductImage(
      {
        title: category,
        name,
        price,
        frontImage,
        backImage,
        productDetail,
        discount,
        voucher,
        tax,
      },
      currentUser?.email || currentUser?.username || ""
    );

    if (!result.ok) {
      setError(result.msg || "Gagal upload produk");
    } else {
      setName("");
      setPrice("");
      setFrontImage("");
      setBackImage("");
      setProductDetail("");
      setDiscount("");
      setVoucher("");
      setTax("");
      setCategory("");
      setUseManualCategory(false);
      setAdminImages(getAllProductImages());
      setError(null);

      // Refresh kategori biar dropdown up to date
      const products = getAllProductImages();
      const categories = Array.from(
        new Set(products.map((p) => (p.title?.trim() ? p.title.trim() : "Tanpa Kategori")))
      );
      setAllCategories(categories);
    }
  }

  if (!mounted) return null;

  return (
    <form
      className="mb-8 flex flex-col gap-4"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <div className="flex gap-4 flex-wrap">
        {/* Category Dropdown */}
        <CategoryDropdown
          allCategories={allCategories}
          useManualCategory={useManualCategory}
          setUseManualCategory={setUseManualCategory}
          category={category}
          setCategory={setCategory}
        />

        {/* Nama produk */}
        <div>
          <label className="block text-xs mb-1 text-yellow-300">Nama Produk *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[180px]"
            placeholder="Nama produk"
            required
          />
        </div>
        {/* Harga produk */}
        <div>
          <label className="block text-xs mb-1 text-yellow-300">Harga Produk *</label>
          <input
            value={price ? formatHargaRp(price) : ""}
            onChange={e => setPrice(e.target.value.replace(/\D/g, ""))}
            className="bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[120px]"
            placeholder="Rp"
            required
          />
        </div>
        {/* Diskon */}
        <div>
          <label className="block text-xs mb-1 text-green-300">Diskon (%)</label>
          <input
            type="number"
            value={discount}
            onChange={e => setDiscount(e.target.value.replace(/\D/g, ""))}
            className="bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[80px]"
            placeholder="0"
            min="0"
            max="99"
          />
        </div>
        {/* Voucher */}
        <div>
          <label className="block text-xs mb-1 text-purple-300">Voucher (Rp)</label>
          <input
            type="number"
            value={voucher}
            onChange={e => setVoucher(e.target.value.replace(/\D/g, ""))}
            className="bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[120px]"
            placeholder="0"
            min="0"
          />
        </div>
        {/* Pajak */}
        <div>
          <label className="block text-xs mb-1 text-orange-300">Pajak (%)</label>
          <input
            type="number"
            value={tax}
            onChange={e => setTax(e.target.value.replace(/\D/g, ""))}
            className="bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[80px]"
            placeholder="11"
            min="0"
            max="99"
          />
        </div>
        {/* Ongkir (preview) */}
        <div>
          <label className="block text-xs mb-1 text-blue-300">Ongkir (5% otomatis)</label>
          <input
            value={formatHargaRp(shipping.toString())}
            className="bg-neutral-900 border border-blue-700 px-2 py-1 rounded text-blue-400 font-bold w-[120px]"
            readOnly
            tabIndex={-1}
          />
        </div>
        {/* Harga Total */}
        <div>
          <label className="block text-xs mb-1 text-pink-400">Harga Total</label>
          <input
            value={formatHargaRp(totalHarga.toString())}
            className="bg-neutral-900 border border-pink-600 px-2 py-1 rounded text-pink-400 font-bold w-[160px]"
            readOnly
            tabIndex={-1}
          />
        </div>
      </div>
      <div className="flex gap-4 flex-wrap">
        {/* Gambar Depan */}
        <div>
          <label className="block text-xs mb-1 text-blue-300">Gambar Depan *</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => handleImageInput(e, setFrontImage)}
            className="block bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[160px]"
            required
          />
          {frontImage && (
            <img
              src={frontImage}
              alt="Gambar Depan"
              className="w-20 h-20 object-cover mt-2 border border-blue-400 rounded"
            />
          )}
        </div>
        {/* Gambar Belakang (opsional) */}
        <div>
          <label className="block text-xs mb-1 text-blue-200">Gambar Belakang</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => handleImageInput(e, setBackImage)}
            className="block bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[160px]"
          />
          {backImage && (
            <img
              src={backImage}
              alt="Gambar Belakang"
              className="w-20 h-20 object-cover mt-2 border border-blue-200 rounded"
            />
          )}
        </div>
        {/* Detail Produk */}
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs mb-1 text-gray-400">Detail Produk *</label>
          <textarea
            value={productDetail}
            onChange={e => setProductDetail(e.target.value)}
            className="bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-full h-[70px]"
            placeholder="Tulis detail produk"
            required
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded"
        >
          Upload Produk
        </button>
        {error && <div className="text-red-400 text-xs ml-4 inline">{error}</div>}
      </div>
    </form>
  );
};

export default UploadFashion;

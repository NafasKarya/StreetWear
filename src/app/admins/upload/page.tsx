"use client";
import React, { useState } from "react";
import { getCurrentUser } from "@/logic/authLocal";
import UploadFashion from "@/components/productCatalog/upload/uploadfashion";

const UploadProductPage = () => {
  // State WAJIB match sama props UploadFashion
  const [category, setCategory] = useState("");
  const [useManualCategory, setUseManualCategory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminImages, setAdminImages] = useState<any[]>([]);

  const currentUser = getCurrentUser();

  if (currentUser?.role !== "admin") {
    return <div className="p-8 text-center text-red-500">Kamu tidak punya akses.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-2xl bg-neutral-900 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl text-yellow-400 font-bold mb-8">Upload Produk Baru</h1>
        <UploadFashion
          useManualCategory={useManualCategory}
          setUseManualCategory={setUseManualCategory}
          category={category}
          setCategory={setCategory}
          setAdminImages={setAdminImages}
          currentUser={currentUser}
          error={error}
          setError={setError}
        />
      </div>
    </div>
  );
};

export default UploadProductPage;

"use client";  // Menambahkan directive untuk menandakan komponen client

import AdminProductUploadForm from "@/components/admin/upload/AdminProductUploadForm";
import { useAdminProductStore } from "@/store/admin/product/useAdminProductStore";

import { useRouter } from "next/navigation";

export default function UploadProductPage() {
  const router = useRouter();  // Menggunakan useRouter
  const { storeProduct, loading, error, success } = useAdminProductStore();

  const handleSubmit = async (payload: any) => {
    try {
      await storeProduct(payload);  // Menyimpan produk baru

      // Pastikan success berhasil
      if (success) {
        router.push("/admins/dashboard");  // Redirect ke dashboard cuma kalau berhasil
      }
    } catch (err) {
      // Kalau error, jangan redirect
      console.error("Error during product creation:", err);
    }
  };

  return (
    <AdminProductUploadForm
      mode="create"
      loading={loading}
      error={error}
      onSubmit={handleSubmit}  // Pastikan onSubmit diteruskan ke form
    />
  );
}

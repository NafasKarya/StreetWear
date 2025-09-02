// src/components/admin/upload/AdminEditProductPage.tsx
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import AdminProductUploadForm from "./AdminProductUploadForm";
import { useEditProductStore } from "@/store/admin/product/useAdminEditProductStore";
import { useAdminProductStore } from "@/store/admin/product/useAdminProductStore";

// Tambahkan tipe props dan deklarasi uuid
type AdminEditProductPageProps = {
  uuid: string;
};

export default function AdminEditProductPage({ uuid }: AdminEditProductPageProps) {
  const router = useRouter();

  const {
    getProductDetail,
    productDetail,
    loading,
    error,
    getAdminProducts,
  } = useAdminProductStore();

  const { editProduct } = useEditProductStore();

  useEffect(() => {
    if (uuid) {
      getProductDetail(uuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  // Handler untuk submit form
  const handleSubmit = async (payload: any) => {
    if (!uuid) return;

    const success = await editProduct(uuid, payload);
    if (success) {
      await getAdminProducts();
      router.push("/admins");
    }
  };

  return (
    <AdminProductUploadForm
      mode="edit"
      initialData={productDetail || undefined}
      loading={loading}
      error={error || null}
      onSubmit={handleSubmit}
      uuid={uuid}
    />
  );
}

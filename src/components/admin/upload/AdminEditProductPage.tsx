import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminProductStore } from "@/store/product/useAdminProductStore";
import AdminProductUploadForm from "./AdminProductUploadForm";
import { useEditProductStore } from "@/store/product/useAdminEditProductStore";

export default function AdminEditProductPage() {
  const router = useRouter();
  const { uuid } = useParams<{ uuid: string }>();

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
  }, [uuid, getProductDetail]);

  // Handler untuk submit form
  const handleSubmit = async (payload: any) => {
    if (!uuid) return;

    const success = await editProduct(uuid, payload);
    if (success) {
      await getAdminProducts();
      router.push("/admins");
    }
  };

  // Pastikan onSubmit diteruskan ke AdminProductUploadForm
  return (
    <AdminProductUploadForm
      mode="edit"
      initialData={productDetail || undefined}
      loading={loading}
      error={error || null}
      onSubmit={handleSubmit}  // Pastikan handleSubmit diteruskan dengan benar
      uuid={uuid}
    />
  );
}

"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";

import DetailProductAdmin from "@/components/admin/show/DetailProductAdmin";
import { useAdminProductStore } from "@/store/admin/product/useAdminProductStore";

export default function ProductDetailPage() {
  const params = useParams();
  // UUID langsung dari root, param-nya tetap 'id' karena [id]
  const uuid =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const { getProductDetail } = useAdminProductStore();

  useEffect(() => {
    if (uuid) getProductDetail(uuid);
  }, [uuid, getProductDetail]);

  return <DetailProductAdmin productId={uuid} />;
}

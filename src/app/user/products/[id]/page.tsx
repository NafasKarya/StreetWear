"use client";
import { useParams } from "next/navigation";
import DetailProductUser from "@/components/user/show/DetailProductUser";

export default function UserProductDetailPage() {
  const params = useParams();
  console.log("params", params); // biar yakin dapetnya 'id'

  const productId = typeof params?.id === "string"
    ? params.id
    : Array.isArray(params?.id)
    ? params.id[0]
    : undefined;

  if (!productId) {
    return (
      <div className="flex items-center justify-center h-32 text-red-500">
        Product ID tidak ditemukan di URL.
      </div>
    );
  }

  return <DetailProductUser productId={productId} />;
}

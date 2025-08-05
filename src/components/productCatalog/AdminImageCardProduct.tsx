import React from "react";
import { ProductImage, calcTotalHargaProduk, formatHargaRp } from "@/logic/productLogic";

const AdminImageCardProduct = ({
  name,
  price,
  frontImage,
  discount,
  voucher,
  tax,
  shipping,
  uploadedBy,
  createdAt,
  isAdmin,
  onDelete,
  onClick, // <-- tambahkan onClick!
}: ProductImage & { isAdmin: boolean; onDelete?: () => void; onClick?: () => void }) => {
  const finalHarga = calcTotalHargaProduk({
    price,
    discount,
    voucher,
    tax,
    shipping,
  });

  return (
    <div
      className="group cursor-pointer relative"
      onClick={onClick}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      role="button"
      aria-label={`Lihat detail ${name}`}
    >
      <div className="bg-neutral-900 overflow-hidden rounded-xl aspect-[4/5] min-h-[200px] flex items-center justify-center">
        <img src={frontImage} alt={name} className="w-full h-full object-cover" />
        {isAdmin && (
          <button
            className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 rounded-full p-1 text-white"
            onClick={e => {
              e.stopPropagation(); // Supaya klik hapus gak ikut klik detail
              onDelete?.();
            }}
            title="Hapus produk"
          >✕</button>
        )}
      </div>
      <div className="text-center mt-3 px-2">
        <p className="text-sm text-yellow-400 font-bold">{name}</p>
        <p className="text-base text-white font-bold">{formatHargaRp(finalHarga.toString())}</p>
        {isAdmin && (
          <p className="text-[10px] text-gray-500 mt-2">
            Upload by {uploadedBy}
            <span className="block">{new Date(createdAt).toLocaleString()}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminImageCardProduct;

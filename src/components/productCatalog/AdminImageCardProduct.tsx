import React from "react";
import { ProductImage, calcTotalHargaProduk, formatHargaRp } from "@/logic/productLogic";

type ExtraProps = {
  id: number;                         // wajib: dipakai buat hapus & busy state
  isAdmin?: boolean;                  // opsional; default false
  onDelete?: (id: number) => void;    // sekarang terima ID
  deletingIds?: Set<number>;          // opsional; untuk disable/spinner tombol
  onClick?: () => void;               // klik ke detail
  title?: string;                     // optional supaya aman (fallback display name)
};

const AdminImageCardProduct = ({
  // ProductImage core
  id,
  name,
  title,           // 🔑 fallback
  price,
  frontImage,
  discount,
  voucher,
  tax,
  shipping,
  uploadedBy,
  createdAt,

  // extra props
  isAdmin = false,
  onDelete,
  deletingIds,
  onClick,
}: ProductImage & ExtraProps) => {
  const finalHarga = calcTotalHargaProduk({
    price,
    discount,
    voucher,
    tax,
    shipping,
  });

  // ✅ Fallback nama: name → title → "Untitled"
  const displayName = name || title || "Untitled";

  // busy state: kalau id sedang dihapus
  const busy = deletingIds?.has(id) ?? false;

  return (
    <div
      className="group cursor-pointer relative"
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      role="button"
      aria-label={`Lihat detail ${displayName}`}
    >
      <div className="bg-neutral-900 overflow-hidden rounded-xl aspect-[4/5] min-h-[200px] flex items-center justify-center relative">
        <img src={frontImage} alt={displayName} className="w-full h-full object-cover" />

        {/* Tombol hapus hanya tampak untuk admin */}
        {isAdmin && onDelete && (
          <button
            type="button"
            className={[
              "absolute top-2 right-2 rounded-full px-2 py-1 text-xs",
              busy
                ? "bg-red-500/40 border border-red-400 text-white/70 cursor-not-allowed"
                : "bg-red-500 border border-red-400 text-white hover:bg-red-600",
            ].join(" ")}
            onClick={(e) => {
              e.stopPropagation(); // jangan trigger onClick detail
              if (!busy) onDelete(id); // kirim ID
            }}
            disabled={busy}
            title={busy ? "Menghapus..." : "Hapus produk"}
            aria-label="Hapus produk"
          >
            {busy ? "..." : "✕"}
          </button>
        )}
      </div>

      <div className="text-center mt-3 px-2">
        {/* Nama di bawah card = productName (jika ada) atau title */}
        <p className="text-sm text-yellow-400 font-bold">{displayName}</p>
        <p className="text-base text-white font-bold">
          {formatHargaRp(finalHarga.toString())}
        </p>

        {isAdmin && uploadedBy && createdAt && (
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

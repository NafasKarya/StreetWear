// src/components/product/AdminActionButtons.tsx
"use client";

type Props = {
  isAdmin: boolean;
  onPostProduct: () => void;
  onManageAccessCodes: () => void;
};

export default function AdminActionButtons({
  isAdmin,
  onPostProduct,
  onManageAccessCodes,
}: Props) {
  if (!isAdmin) return null;
  return (
    <div className="mb-10 flex flex-wrap gap-3">
      <button
        className="px-5 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300 active:scale-95 transition-all"
        onClick={onPostProduct}
      >
        Post Product
      </button>

      <button
        className="px-5 py-2 rounded bg-indigo-400 text-black font-bold hover:bg-indigo-300 active:scale-95 transition-all"
        onClick={onManageAccessCodes}
        title="Kelola (edit/rotate/hapus) semua kode akses"
      >
        Kelola Kode Akses
      </button>
    </div>
  );
}

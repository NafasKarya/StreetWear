"use client";

import React from "react";

interface CartItem {
  id: number;
  name: string;
  price: string;
  qty: number;
  size: string;
  imageUrl: string;
}

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onAddQty: (id: number, size: string) => void;
  onRemoveQty: (id: number, size: string) => void;
  onCheckout?: () => void; // ✅ tambahin di sini
}

function parseHarga(price: string) {
  return parseInt(price.replace(/[^\d]/g, ""), 10) || 0;
}
function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}
function safeSrc(url: string | undefined | null) {
  const v = (url ?? "").trim();
  return v.length > 0 ? v : null;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  onClose,
  onAddQty,
  onRemoveQty,
  onCheckout, // ✅ ambil dari props
}) => {
  const totalPrice = items.reduce(
    (sum, item) => sum + parseHarga(item.price) * item.qty,
    0
  );

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[998] animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 h-full w-[92vw] max-w-sm bg-black text-white z-[9999] shadow-2xl animate-slide-in flex flex-col border-l border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <span className="font-extrabold text-xl tracking-widest uppercase">
            Cart
            <span className="ml-2 text-yellow-400 text-sm font-mono">
              ({items.length})
            </span>
          </span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <svg
              width={24}
              height={24}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="text-center text-neutral-500 pt-10 font-bold uppercase tracking-widest text-sm">
              Cart Empty
            </div>
          ) : (
            items.map((item, i) => {
              const src = safeSrc(item.imageUrl);
              return (
                <div
                  key={`${item.id}-${item.size}-${i}`}
                  className="mb-6 flex gap-4 items-center border-b border-white/5 pb-5"
                >
                  {src ? (
                    <img
                      src={src}
                      className="w-16 h-16 object-cover rounded-lg bg-neutral-800"
                      alt={item.name || "Produk"}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-neutral-800 grid place-items-center text-xs text-neutral-400">
                      No Img
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="font-bold text-white uppercase text-sm tracking-wider">
                      {item.name || "Tanpa nama"}
                    </div>
                    <div className="text-yellow-400 font-extrabold text-lg mt-1">
                      {item.price}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1 uppercase">
                      Size: {item.size}
                    </div>

                    {/* Qty Control */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => onRemoveQty(item.id, item.size)}
                        className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center font-bold text-lg hover:bg-white/10 hover:text-red-400 transition"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-6 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => onAddQty(item.id, item.size)}
                        className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center font-bold text-lg hover:bg-white/10 hover:text-green-400 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-5">
              <span className="text-white/80 uppercase font-bold tracking-widest">
                Total
              </span>
              <span className="text-yellow-400 font-extrabold text-xl">
                {formatRupiah(totalPrice)}
              </span>
            </div>
            <button
              className="w-full py-4 rounded-xl bg-yellow-400 text-black font-extrabold text-sm uppercase tracking-widest hover:bg-yellow-300 transition disabled:opacity-40"
              disabled={items.length === 0}
              onClick={onCheckout ?? (() => alert("Checkout dummy"))} // ✅ fallback
            >
              Checkout
            </button>
          </div>
        )}
      </aside>

      {/* Animations */}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%);} to { transform: translateX(0);} }
        .animate-slide-in { animation: slideIn 0.28s cubic-bezier(.77,0,.18,1) }
        @keyframes fadeIn { from {opacity:0} to {opacity:1} }
        .animate-fade-in { animation: fadeIn .2s }
      `}</style>
    </>
  );
};

export default CartDrawer;

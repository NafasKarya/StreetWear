import React, { useEffect, useRef, useState } from "react";
import { useCart } from "./CartContext";

function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}
function parseHarga(str: string) {
  return parseInt(str.replace(/[^\d]/g, ""), 10) || 0;
}

const Cart: React.FC<{ onCheckout: () => void }> = ({ onCheckout }) => {
  const { items, open, openCart, closeCart, removeFromCart, addQty } = useCart();
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseHarga(item.price) * item.qty, 0
  );

  // Animasi badge: state buat trigger animasi tiap Cart update
  const [cartAnim, setCartAnim] = useState(false);
  const prevQty = useRef(totalQty);

  useEffect(() => {
    // Kalau jumlah Cart nambah, trigger animasi
    if (totalQty > prevQty.current) {
      setCartAnim(true);
      setTimeout(() => setCartAnim(false), 480); // waktu animasi harus match di css
    }
    prevQty.current = totalQty;
  }, [totalQty]);

  return (
    <>
      <button
        id="cart-icon"
        className="flex items-center gap-2 hover:text-white transition-colors relative"
        onClick={openCart}
        aria-label="Open cart"
        type="button"
      >
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
        <span
          className={`font-bold transition-transform duration-300 select-none ${
            cartAnim ? "cart-bounce" : ""
          }`}
        >
          Cart ({totalQty})
        </span>
        <style>{`
          @keyframes cart-bounce {
            0% { transform: scale(1);}
            20% { transform: scale(1.18);}
            45% { transform: scale(0.89);}
            75% { transform: scale(1.09);}
            100% { transform: scale(1);}
          }
          .cart-bounce {
            animation: cart-bounce 0.48s cubic-bezier(.66,0,.43,1.05);
          }
        `}</style>
      </button>
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 transition-opacity animate-fade-in"
            onClick={closeCart}
            aria-label="Close cart drawer"
          />
          {/* Drawer */}
          <aside className="fixed top-0 right-0 h-full w-[92vw] max-w-sm bg-neutral-900 text-white z-50 shadow-2xl animate-slide-in flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-neutral-700">
              <span className="font-bold text-2xl">
                Keranjang
                <span className="ml-2 text-yellow-400 text-lg font-mono font-normal">
                  ({items.length} barang)
                </span>
              </span>
              <button
                onClick={closeCart}
                aria-label="Tutup Cart"
                className="hover:text-red-400 transition-colors"
              >
                <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="text-center text-gray-400 pt-10">Keranjang kosong</div>
              ) : (
                items.map((item, i) => (
                  <div key={i} className="mb-6 border-b border-neutral-700 pb-6 flex gap-4 items-center">
                    <img src={item.imageUrl} className="w-16 h-16 object-cover rounded" alt={item.name} />
                    <div className="flex-1">
                      <div className="font-bold text-white text-md tracking-wide">{item.name}</div>
                      <div className="text-yellow-400 font-bold text-lg">{item.price}</div>
                      <div className="text-xs text-gray-400 mt-1">Size: {item.size}</div>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="bg-neutral-800 w-10 h-10 rounded text-lg font-bold text-yellow-400 hover:text-red-500 transition-colors flex items-center justify-center"
                          aria-label="Kurangi jumlah"
                        >-</button>
                        <span className="text-base font-bold w-8 text-center">{item.qty}</span>
                        <button
                          onClick={() => addQty(item.id, item.size)}
                          className="bg-neutral-800 w-10 h-10 rounded text-lg font-bold text-yellow-400 hover:text-green-400 transition-colors flex items-center justify-center"
                          aria-label="Tambah jumlah"
                        >+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {items.length > 0 && (
                <div className="mt-4 mb-2 flex items-center justify-between border-t border-neutral-700 pt-6">
                  <span className="font-bold text-lg text-white">Total</span>
                  <span className="text-yellow-400 font-extrabold text-xl">{formatRupiah(totalPrice)}</span>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-neutral-700">
              <button
                className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold text-base hover:bg-yellow-300 transition-colors"
                disabled={items.length === 0}
                onClick={() => {
                  closeCart();
                  onCheckout();
                }}
              >
                Checkout
              </button>
            </div>
          </aside>
          <style>{`
            @keyframes slideIn { from { transform: translateX(100%);} to { transform: translateX(0);} }
            .animate-slide-in { animation: slideIn 0.26s cubic-bezier(.77,0,.18,1) }
            @keyframes fadeIn { from {opacity:0} to {opacity:1} }
            .animate-fade-in { animation: fadeIn .18s }
          `}</style>
        </>
      )}
    </>
  );
};

export default Cart;

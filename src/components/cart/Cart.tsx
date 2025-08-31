"use client";

import React, { useEffect, useRef, useState } from "react";
import CartDrawer from "./CartButtonWithDrawer";
import { useCart } from "./CartContext";

interface CartProps {
  onCheckout?: () => void; // ✅ tambahin props ini
}

const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const {
    open,
    openCart,
    closeCart,
    items,
    addQty,
    removeFromCart,
    addToCart,
  } = useCart();

  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const [cartAnim, setCartAnim] = useState(false);
  const prevQty = useRef(totalQty);

  // inject dummy items sekali saat mount
  useEffect(() => {
    if (items.length === 0) {
      const dummy1 = {
        id: 101,
        name: "Oversize Hoodie Blackout",
        price: "Rp350.000",
        size: "L",
        imageUrl: "/assets/images/hoodie-black.jpg",
        qty: 1,
      };
      const dummy2 = {
        id: 102,
        name: "Street Cap Yellow",
        price: "Rp150.000",
        size: "All Size",
        imageUrl: "/assets/images/cap-yellow.jpg",
        qty: 2,
      };
      addToCart(dummy1);
      addToCart(dummy2);
    }
  }, []);

  useEffect(() => {
    if (totalQty > prevQty.current) {
      setCartAnim(true);
      setTimeout(() => setCartAnim(false), 480);
    }
    prevQty.current = totalQty;
  }, [totalQty]);

  return (
    <>
      <button
        onClick={openCart}
        className="flex items-center gap-2 hover:text-white transition-colors relative"
        aria-label="Open cart"
        type="button"
      >
        <svg
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <span
          className={`font-bold transition-transform duration-300 select-none ${
            cartAnim ? "cart-bounce" : ""
          }`}
        >
          Cart ({totalQty})
        </span>
      </button>

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

      {open && (
        <CartDrawer
          open={open}
          onClose={closeCart}
          items={items}
          onAddQty={addQty}
          onRemoveQty={removeFromCart}
          onCheckout={onCheckout} // ✅ lempar ke drawer
        />
      )}
    </>
  );
};

export default Cart;

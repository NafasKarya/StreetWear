import React, { createContext, useContext, useState } from "react";

export type CartItem = {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
  size: string;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: number, size: string) => void;
  addQty: (id: number, size: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  // FIXED: safe update qty
  const addToCart = (item: Omit<CartItem, "qty">) => {
    setItems(prev => {
      // Cari item dengan id dan size yang sama
      const found = prev.find(
        x => x.id === item.id && x.size === item.size
      );
      if (found) {
        // Sudah ada: update qty (jangan pake index, pake map)
        return prev.map(x =>
          x.id === item.id && x.size === item.size
            ? { ...x, qty: x.qty + 1 }
            : x
        );
      } else {
        // Belum ada: push baru
        return [...prev, { ...item, qty: 1 }];
      }
    });
    // setOpen(true); // jangan auto open, biar controllable
  };

  const removeFromCart = (id: number, size: string) => {
    setItems(prev =>
      prev
        .map(item =>
          item.id === id && item.size === size
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter(item => item.qty > 0)
    );
  };

  const addQty = (id: number, size: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.size === size
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        openCart: () => setOpen(true),
        closeCart: () => setOpen(false),
        addToCart,
        removeFromCart,
        addQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

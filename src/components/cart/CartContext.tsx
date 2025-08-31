"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";

// --- types ---
type CartItem = {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
  size: string;
  qty: number;
};

type CartState = {
  open: boolean;
  items: CartItem[];
};

type Action =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "ADD"; payload: Omit<CartItem, "qty"> & { qty?: number } }
  | { type: "ADD_QTY"; payload: { id: number; size: string; by?: number } }
  | { type: "REMOVE_ONE"; payload: { id: number; size: string } }
  | { type: "SET"; payload: CartState };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "OPEN": return { ...state, open: true };
    case "CLOSE": return { ...state, open: false };
    case "ADD": {
      const { id, size } = action.payload;
      const qty = Math.max(1, action.payload.qty ?? 1);
      const idx = state.items.findIndex(i => i.id === id && i.size === size);
      const items = [...state.items];
      if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + qty };
      else items.push({ ...action.payload, qty });
      return { ...state, items };
    }
    case "ADD_QTY": {
      const { id, size, by = 1 } = action.payload;
      const items = state.items
        .map(i => (i.id === id && i.size === size ? { ...i, qty: i.qty + by } : i))
        .filter(i => i.qty > 0);
      return { ...state, items };
    }
    case "REMOVE_ONE": {
      const { id, size } = action.payload;
      const items = state.items
        .map(i => (i.id === id && i.size === size ? { ...i, qty: i.qty - 1 } : i))
        .filter(i => i.qty > 0);
      return { ...state, items };
    }
    case "SET": return action.payload;
    default: return state;
  }
}

const CartCtx = createContext<{
  open: boolean;
  items: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  addQty: (id: number, size: string) => void;
  removeFromCart: (id: number, size: string) => void;
} | null>(null);

// --- provider ---
type CartProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
};

export function CartProvider({
  children,
  storageKey = "cart:v1",
}: CartProviderProps) {
  const initialState: CartState = { open: false, items: [] };

  const [state, dispatch] = React.useReducer(reducer, initialState, (init) => {
    if (typeof window === "undefined") return init;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return init;
      const parsed = JSON.parse(raw) as CartState;
      if (!parsed || !Array.isArray(parsed.items)) return init;
      return { open: false, items: parsed.items };
    } catch {
      return init;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ open: false, items: state.items }));
    } catch {}
  }, [state.items, storageKey]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as CartState;
          if (parsed && Array.isArray(parsed.items)) {
            dispatch({ type: "SET", payload: { open: state.open, items: parsed.items } });
          }
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [state.open, storageKey]);

  const api = useMemo(() => ({
    open: state.open,
    items: state.items,
    openCart: () => dispatch({ type: "OPEN" }),
    closeCart: () => dispatch({ type: "CLOSE" }),
    addToCart: (item: Omit<CartItem, "qty"> & { qty?: number }) => {
      const qty = Math.max(1, item.qty ?? 1);
      dispatch({ type: "ADD", payload: item });
    },
    addQty: (id: number, size: string) => {
      dispatch({ type: "ADD_QTY", payload: { id, size, by: 1 } });
    },
    removeFromCart: (id: number, size: string) => {
      dispatch({ type: "REMOVE_ONE", payload: { id, size } });
    },
  }), [state]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

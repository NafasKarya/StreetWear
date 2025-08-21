"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";

type CartItem = {
  id: number;
  name: string;
  price: string;     // contoh: "Rp 120.000" atau "120000"
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

// --- utils ---
function parseNumberLike(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

// --- server sync helpers (private per user) ---
type SrvItem = { productId: number; sizeLabel: string; qty: number; price: string | number };

async function apiGetCart(): Promise<SrvItem[]> {
  try {
    const r = await fetch("/api/cart", { method: "GET", credentials: "include", cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    return (j?.cart?.items ?? []) as SrvItem[];
  } catch {
    return [];
  }
}

async function apiPostAdd(productId: number, sizeLabel: string, qty: number, price: number) {
  await fetch("/api/cart", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, sizeLabel, qty, price }),
  });
}

async function apiPatchBy(productId: number, sizeLabel: string, by: number) {
  await fetch("/api/cart", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, sizeLabel, by }),
  });
}

function mapSrvToItems(srv: SrvItem[]): CartItem[] {
  return srv.map(s => ({
    id: s.productId,
    name: "",          // optional: isi client-side kalau punya cache product
    imageUrl: "",      // biar aman sama <img>, komponen-mu sudah guard safeSrc
    price: String(s.price ?? "0"),
    size: s.sizeLabel,
    qty: s.qty ?? 0,
  }));
}

type CartProviderProps = {
  children: React.ReactNode;
  storageKey?: string;          // default: "cart:v1"
  sessionScope?: string;        // opsional (buat segmentasi / future use)
  disabled?: boolean;           // kalau true: skip semua sync server & metrics
  metricsEndpoint?: string;     // optional: POST metrics
};

export function CartProvider({
  children,
  storageKey = "cart:v1",
  sessionScope = "user",
  disabled = false,
  metricsEndpoint,
}: CartProviderProps) {
  const initialState: CartState = { open: false, items: [] };

  // lazy init dari localStorage
  const [state, dispatch] = React.useReducer(reducer, initialState, (init) => {
    if (typeof window === "undefined") return init;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return init;
      const parsed = JSON.parse(raw) as CartState;
      if (!parsed || !Array.isArray(parsed.items)) return init;
      return { open: false, items: parsed.items };
    } catch { return init; }
  });

  // persist items
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ open: false, items: state.items })); } catch {}
  }, [state.items, storageKey]);

  // sync antar-tab
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

  // initial refresh: server = source of truth (kalau login)
  useEffect(() => {
    if (disabled) return; // skip sync saat disabled
    (async () => {
      const srv = await apiGetCart();
      const items = mapSrvToItems(srv);
      dispatch({ type: "SET", payload: { open: false, items } });
    })();
  }, [disabled]);

  const fireMetric = (event: string, payload: any) => {
    if (!metricsEndpoint || disabled) return;
    try {
      fetch(metricsEndpoint, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, scope: sessionScope, payload, ts: Date.now() }),
      }).catch(() => {});
    } catch {}
  };

  const api = useMemo(() => ({
    open: state.open,
    items: state.items,

    openCart: () => dispatch({ type: "OPEN" }),
    closeCart: () => dispatch({ type: "CLOSE" }),

    // Semua mutasi ke /api/cart kecuali disabled
    addToCart: (item: Omit<CartItem, "qty"> & { qty?: number }) => {
      const qty = Math.max(1, item.qty ?? 1);

      // optimistic update lokal
      dispatch({ type: "ADD", payload: item });

      fireMetric("cart:add", { id: item.id, size: item.size, qty });

      if (disabled) return;
      const priceNum = parseNumberLike(item.price);
      apiPostAdd(item.id, item.size, qty, priceNum)
        .then(apiGetCart)
        .then((srv) => {
          dispatch({ type: "SET", payload: { open: false, items: mapSrvToItems(srv) } });
        })
        .catch(() => { /* biarin lokal, nanti reload tersinkron */ });
    },

    addQty: (id: number, size: string) => {
      dispatch({ type: "ADD_QTY", payload: { id, size, by: 1 } });
      fireMetric("cart:add_qty", { id, size, by: 1 });

      if (disabled) return;
      apiPatchBy(id, size, +1)
        .then(apiGetCart)
        .then((srv) => {
          dispatch({ type: "SET", payload: { open: false, items: mapSrvToItems(srv) } });
        })
        .catch(() => {});
    },

    removeFromCart: (id: number, size: string) => {
      dispatch({ type: "REMOVE_ONE", payload: { id, size } });
      fireMetric("cart:remove_one", { id, size, by: -1 });

      if (disabled) return;
      apiPatchBy(id, size, -1)
        .then(apiGetCart)
        .then((srv) => {
          dispatch({ type: "SET", payload: { open: false, items: mapSrvToItems(srv) } });
        })
        .catch(() => {});
    },
  }), [state, disabled, metricsEndpoint, sessionScope]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

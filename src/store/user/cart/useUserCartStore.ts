import { create } from 'zustand';
import axios from 'axios';

export const USER_GET_CART_URL = 'http://127.0.0.1:8000/api/cart';

export interface CartItem {
  id: number;
  product_id: number;
  size: string;
  quantity: number;
  // Tambah field lain sesuai struktur cart API lo (misal: product info, image, price, dll)
  [key: string]: any;
}

interface UserCartState {
  isLoading: boolean;
  error: string | null;
  cart: CartItem[];
  fetchCart: () => Promise<void>;
}

export const useUserCartStore = create<UserCartState>((set) => ({
  isLoading: false,
  error: null,
  cart: [],
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      // Ambil token dari localStorage (nama harus sama kayak login store lo!)
      const token =
        typeof window !== "undefined" ? localStorage.getItem("user_token") : null;
      const res = await axios.get(USER_GET_CART_URL, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          "Content-Type": "application/json",
        },
      });

      // FIX: Parsing cart dari key "items" (bukan "data")
      set({
        isLoading: false,
        error: null,
        cart: res.data?.items ?? [], // <--- ini yang dibenerin bro!
      });
    } catch (err: any) {
      let msg = "Gagal mengambil cart.";
      if (axios.isAxiosError(err)) {
        const resData = err.response?.data;
        if (typeof resData === "string") msg = resData;
        else if (typeof resData?.message === "string") msg = resData.message;
        else if (typeof resData?.errors === "object" && resData.errors !== null) {
          msg = Object.values(resData.errors).flat().join(", ");
        } else {
          msg = JSON.stringify(resData);
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      set({ isLoading: false, error: msg, cart: [] });
    }
  },
}));

import { create } from 'zustand';
import axios from 'axios';

export const USER_CREATE_CART_URL = 'http://127.0.0.1:8000/api/cart';

export interface CreateCartPayload {
  product_id: string | number;
  size: string;
  quantity: number;
}

interface UserCreateCartState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  createCart: (payload: CreateCartPayload) => Promise<void>;
}

export const useUserCreateCartStore = create<UserCreateCartState>((set) => ({
  isLoading: false,
  isSuccess: false,
  error: null,
  createCart: async (payload) => {
    set({ isLoading: true, error: null, isSuccess: false });
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("user_token") : null;
      await axios.post(USER_CREATE_CART_URL, payload, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          "Content-Type": "application/json",
        },
      });
      set({ isLoading: false, isSuccess: true, error: null });
    } catch (err: any) {
      let msg = "Gagal menambah ke keranjang.";
      if (axios.isAxiosError(err)) {
        const resData = err.response?.data;
        if (typeof resData === "string") msg = resData;
        else if (typeof resData?.message === "string") msg = resData.message;
        else if (typeof resData?.errors === "object" && resData.errors !== null) {
          msg = Object.values(resData.errors).flat().join(', ');
        } else {
          msg = JSON.stringify(resData);
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      set({ isLoading: false, isSuccess: false, error: msg });
    }
  },
}));

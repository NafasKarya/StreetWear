import { create } from "zustand";
import axios from "axios";

// Endpoint dinamis, jangan hardcode id di belakang!
export const USER_SHOW_PRODUCT_URL = (id: string | number) =>
  `http://127.0.0.1:8000/api/user/products/${id}`;

// Tipe produk detail harus cocok sama respons API
export interface UserShowProduct {
  id: number;
  uuid: string;
  title: string;
  name: string;
  price: number;
  stock: number;
  front_image: string;
  back_image?: string;
  gallery_images?: string[];
  sizes?: any[];
  description?: string;
  expired_at?: string;
  category_uuid?: string;
  category_name?: string;
  category_slug?: string;
  [key: string]: unknown;
}

interface UserShowProductState {
  isLoading: boolean;
  error: string | null;
  product: UserShowProduct | null;
  fetchProduct: (id: string | number) => Promise<void>;
}

// Helper buat extract error asli dari backend
const extractErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === "string") return data;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.errors === "object" && data.errors !== null) {
      return Object.values(data.errors).flat().join(", ");
    }
    if (err.response?.status === 401) return "unauthorized";
    return JSON.stringify(data);
  }
  return err instanceof Error ? err.message : "Gagal ambil produk!";
};

export const useUserShowProduct = create<UserShowProductState>((set) => ({
  isLoading: false,
  error: null,
  product: null,
  fetchProduct: async (id: string | number) => {
    set({ isLoading: true, error: null, product: null });
    try {
      const token = localStorage.getItem("user_token");
      const res = await axios.get(USER_SHOW_PRODUCT_URL(id), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      set({
        product: res.data?.data ?? res.data?.product ?? null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: extractErrorMessage(err),
        product: null,
      });
    }
  },
}));

import { create } from 'zustand';
import axios from 'axios';

export const USER_GET_PRODUCTS_URL = 'http://127.0.0.1:8000/api/user/products';

// Typing produk, sesuaiin sama response terbaru dari API lo!
export interface UserProduct {
  id: number;
  uuid: string;
  title: string;
  name: string;
  price: number;
  stock: number;
  front_image: string;
  back_image?: string;
  category_uuid: string;
  category_name: string;
  category_slug: string;
  // Kalau ada tambahan field di masa depan, biarin aja open index signature:
  [key: string]: unknown;
}

interface UserProductState {
  isLoading: boolean;
  error: string | null;
  products: UserProduct[];
  fetchProducts: () => Promise<void>;
}

// Helper untuk extract error asli dari backend
const extractErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401) return "unauthorized"; // <- tambahin ini buat detect token expired/session habis
    const data = err.response?.data;
    if (typeof data === 'string') return data;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.errors === 'object' && data.errors !== null) {
      return Object.values(data.errors).flat().join(', ');
    }
    return JSON.stringify(data);
  }
  return err instanceof Error ? err.message : 'Gagal mengambil produk, bro!';
};

export const useUserProduct = create<UserProductState>((set) => ({
  isLoading: false,
  error: null,
  products: [],
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      // Ambil token user dari localStorage
      const token = localStorage.getItem('user_token');
      const res = await axios.get(USER_GET_PRODUCTS_URL, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      });
      // Map ke tipe UserProduct, fallback ke array kosong kalo data nggak ada
      set({ products: Array.isArray(res.data?.data) ? res.data.data : [], isLoading: false, error: null });
    } catch (err) {
      set({ isLoading: false, error: extractErrorMessage(err), products: [] });
    }
  }
}));

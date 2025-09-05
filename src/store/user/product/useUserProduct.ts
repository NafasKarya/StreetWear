import { create } from 'zustand';
import axios from 'axios';
import { UserProduct } from '@/store/type/types';

export const USER_GET_PRODUCTS_URL = 'https://api.nafaskarya.my.id/api/user/products';

interface UserProductState {
  isLoading: boolean;
  error: string | null;
  products: UserProduct[];
  fetchProducts: () => Promise<void>;
}

// Utility untuk ambil array kode unlock dari localStorage
function getUnlockCodes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("user_unlock_code");
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    // Fallback buat legacy (string satuan)
    if (typeof arr === "string") return [arr];
    return [];
  } catch {
    return [];
  }
}

function normalizeUserProduct(raw: any): UserProduct {
  return {
    id: Number(raw.id) ?? 0,
    uuid: raw.uuid ?? "",
    title: raw.title ?? "",
    name: raw.name ?? "",
    price: Number(raw.price) ?? 0,
    stock: Number(raw.stock) ?? 0,
    front_image: raw.front_image ?? "",
    back_image: raw.back_image ?? "",
    category_uuid: raw.category_uuid ?? "",
    category_name: raw.category_name ?? "",
    category_slug: raw.category_slug ?? "",
    expired_at: typeof raw.expired_at === "string" ? raw.expired_at : undefined,
    is_locked: typeof raw.is_locked === "boolean" ? raw.is_locked : false,
    hidden_code: raw.hidden_code ?? undefined,
  };
}

const extractErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401) return "unauthorized";
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
      const token = localStorage.getItem('user_token');
      // Ambil semua kode unlock (bisa array!)
      const unlockCodes = getUnlockCodes();
      const params = unlockCodes.length > 0 ? { code: unlockCodes } : undefined;

      const res = await axios.get(USER_GET_PRODUCTS_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params,
      });

      set({
        products: Array.isArray(res.data?.data)
          ? res.data.data.map(normalizeUserProduct)
          : [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({ isLoading: false, error: extractErrorMessage(err), products: [] });
    }
  }
}));

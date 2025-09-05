import { create } from "zustand";
import axios from "axios";
import { USER_UNCLOCK_PRODUCT_URL } from "@/config/api-endpoints";

type UserUnlockProductState = {
  loading: boolean;
  error: string | null;
  success: boolean;
  codes: string[]; // BUKAN string doang
  unlockProduct: (code: string) => Promise<void>;
  reset: (clearCode?: boolean) => void;
};

const getCodes = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("user_unlock_code");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useUserUnlockProduct = create<UserUnlockProductState>((set) => ({
  loading: false,
  error: null,
  success: false,
  codes: getCodes(),

  unlockProduct: async (code: string) => {
    set({ loading: true, error: null, success: false });
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("user_token") : "";
      const codes = getCodes();
      if (!codes.includes(code)) codes.push(code);
      const res = await axios.post(
        USER_UNCLOCK_PRODUCT_URL,
        { code },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.status === 200 || res.status === 201) {
        if (typeof window !== "undefined") {
          localStorage.setItem("user_unlock_code", JSON.stringify(codes));
        }
        set({ loading: false, error: null, success: true, codes });
      } else {
        set({
          loading: false,
          error: typeof res.data?.message === "string" ? res.data.message : "Gagal unlock produk",
          success: false,
        });
      }
    } catch (err) {
      let msg = "Terjadi kesalahan tidak diketahui";
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (typeof data?.message === "string") msg = data.message;
        else if (typeof data === "string") msg = data;
        else if (err.message) msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      set({ loading: false, error: msg, success: false });
    }
  },

  reset: (clearCode = false) => {
    if (clearCode && typeof window !== "undefined") {
      localStorage.removeItem("user_unlock_code");
    }
    set({ loading: false, error: null, success: false, codes: clearCode ? [] : getCodes() });
  },
}));

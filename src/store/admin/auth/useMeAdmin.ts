import axios from "axios";
import { create } from "zustand";
import { ADMIN_ME_URL } from "@/config/api-endpoints";

interface MeAdminState {
  admin: any | null;
  loading: boolean;
  error: string | null;
  fetchMe: () => Promise<void>;
  reset: () => void;
}

export const useMeAdmin = create<MeAdminState>((set) => ({
  admin: null,
  loading: false,
  error: null,

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(ADMIN_ME_URL, {
        withCredentials: true, // WAJIB: cookie JWT dikirim
      });
      set({ admin: data.admin, loading: false, error: null });
    } catch (err: any) {
      set({
        admin: null,
        loading: false,
        error: err?.response?.data?.error || err?.message || "Gagal cek autentikasi"
      });
    }
  },

  reset: () => {
    set({ admin: null, loading: false, error: null });
  },
}));

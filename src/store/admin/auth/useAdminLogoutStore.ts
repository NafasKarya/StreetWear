import { ADMIN_LOGGOUT_URL } from "@/config/api-endpoints";
import { create } from "zustand";



interface AdminLogoutState {
  loading: boolean;
  error: string | null;
  logout: (token: string) => Promise<boolean>;
}

export const useAdminLogoutStore = create<AdminLogoutState>((set) => ({
  loading: false,
  error: null,
  logout: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(ADMIN_LOGGOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.message || "Logout gagal. Silakan coba lagi."
        );
      }
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || "Logout gagal. Silakan coba lagi.",
      });
      return false;
    }
  },
}));

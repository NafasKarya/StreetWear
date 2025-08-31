import { create } from "zustand";

export const ADMIN_LOGGOUT_URL = "http://127.0.0.1:8000/api/admin/logout";

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

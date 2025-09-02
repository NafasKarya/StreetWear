import { ADMIN_EDIT_PROFILE_URL } from "@/config/api-endpoints";
import { create } from "zustand";



type EditProfilePayload = {
  name: string;
  email: string;
  password?: string; // <- Tambahin password opsional!
  // Bisa tambahin field lain kalo backend support
};

type EditProfileResponse = {
  id: number;
  name: string;
  email: string;
  updated_at: string;
  // Tambahkan sesuai struktur response API jika perlu
};

type EditProfileAdminStore = {
  loading: boolean;
  error: string | null;
  data: EditProfileResponse | null;
  editProfile: (payload: EditProfilePayload, token: string) => Promise<void>;
  reset: () => void;
};

export const useEditProfileAdmin = create<EditProfileAdminStore>((set) => ({
  loading: false,
  error: null,
  data: null,

  async editProfile(payload, token) {
    set({ loading: true, error: null });
    try {
      const res = await fetch(ADMIN_EDIT_PROFILE_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to edit profile");
      }

      const data: EditProfileResponse = await res.json();
      set({ data, loading: false });
    } catch (error) {
      let message = "Unknown error";
      if (error instanceof Error) {
        message = error.message;
      }
      set({ error: message, loading: false });
    }
  },

  reset() {
    set({ data: null, error: null, loading: false });
  },
}));

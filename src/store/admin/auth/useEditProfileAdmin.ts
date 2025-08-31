import { create } from "zustand";

export const ADMIN_EDIT_PROFILE_URL = "http://127.0.0.1:8000/api/admin/profile";

type EditProfilePayload = {
  name: string;
  email: string;
  // Tambahkan field lain jika diperlukan
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

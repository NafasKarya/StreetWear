import { create } from 'zustand';
import axios from 'axios';
import { USER_EDIT_PROFILE_URL } from '@/config/api-endpoints';



export interface EditProfileUserPayload {
  name?: string;
  email?: string;
  // tambahin field lain kalau ada
  [key: string]: unknown;
}

interface EditProfileUserState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  editProfileUser: (payload: EditProfileUserPayload) => Promise<void>;
  resetEditProfileUserState: () => void;
}

// Helper error handler
const extractErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === 'string') return data;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.errors === 'object' && data.errors !== null) {
      return Object.values(data.errors).flat().join(', ');
    }
    return JSON.stringify(data);
  }
  return err instanceof Error ? err.message : 'Edit profile gagal, bro!';
};

export const useEditProfileUser = create<EditProfileUserState>((set) => ({
  isLoading: false,
  error: null,
  isSuccess: false,
  editProfileUser: async (payload) => {
    set({ isLoading: true, error: null, isSuccess: false });
    try {
      // Pakai PATCH!
      const token = localStorage.getItem('user_token');
      await axios.patch(USER_EDIT_PROFILE_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ isLoading: false, isSuccess: true });
    } catch (err) {
      set({ isLoading: false, error: extractErrorMessage(err), isSuccess: false });
    }
  },
  resetEditProfileUserState: () => set({ isLoading: false, error: null, isSuccess: false }),
}));

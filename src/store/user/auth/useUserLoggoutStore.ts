import { create } from 'zustand';
import axios from 'axios';

export const USER_LOGGOUT_URL = 'http://127.0.0.1:8000/api/user/logout';

interface UserLoggoutState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  logoutUser: () => Promise<void>;
  resetLogoutState: () => void; // <-- Tambahin ini
}

// Helper buat extract error asli dari backend
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
  return err instanceof Error ? err.message : 'Logout gagal, bro!';
};

export const useUserLoggoutStore = create<UserLoggoutState>((set) => ({
  isLoading: false,
  error: null,
  isSuccess: false,
  logoutUser: async () => {
    set({ isLoading: true, error: null, isSuccess: false });
    try {
      const token = localStorage.getItem('user_token');
      await axios.post(USER_LOGGOUT_URL, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem('user_token');
      set({ isLoading: false, isSuccess: true });
    } catch (err) {
      set({ isLoading: false, error: extractErrorMessage(err), isSuccess: false });
    }
  },
  resetLogoutState: () => set({ isLoading: false, error: null, isSuccess: false }), // <-- Tambahin action ini
}));

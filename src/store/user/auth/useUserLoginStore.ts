import { create } from 'zustand';
import axios from 'axios';

export const USER_LOGIN_URL = 'http://127.0.0.1:8000/api/user/login';

export interface UserLoginPayload {
  email: string;
  password: string;
}

interface UserLoginState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  loginUser: (payload: UserLoginPayload) => Promise<void>;
  resetLoginState: () => void; // << Tambah action reset
}

// Helper buat nampilin error asli dari backend (string, array, object validasi, dll)
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
  return err instanceof Error ? err.message : 'Login gagal, bro!';
};

export const useUserLoginStore = create<UserLoginState>((set) => ({
  isLoading: false,
  error: null,
  isSuccess: false,
  loginUser: async (payload) => {
    set({ isLoading: true, error: null, isSuccess: false });
    try {
      const res = await axios.post(USER_LOGIN_URL, payload);
      // ASUMSI: token ada di res.data.token
      if (res.data && res.data.token) {
        localStorage.setItem('user_token', res.data.token);
      }
      set({ isLoading: false, isSuccess: true });
    } catch (err) {
      set({ isLoading: false, error: extractErrorMessage(err), isSuccess: false });
    }
  },
  resetLoginState: () => set({ isLoading: false, error: null, isSuccess: false }), // << Implementasi reset
}));

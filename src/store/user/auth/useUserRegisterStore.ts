import { create } from 'zustand';
import axios from 'axios';
import { USER_REGISTER_URL } from '@/config/api-endpoints';



// Payload sekarang field-nya code!
export interface UserRegisterPayload {
  code: string;
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
}

interface UserRegisterState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  registerUser: (payload: UserRegisterPayload) => Promise<void>;
}

// Fungsi buat convert error apapun jadi string buat user
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
  return err instanceof Error ? err.message : 'Register gagal, bro!';
};

export const useUserRegisterStore = create<UserRegisterState>((set) => ({
  isLoading: false,
  error: null,
  isSuccess: false,
  registerUser: async (payload) => {
    set({ isLoading: true, error: null, isSuccess: false });
    try {
      const res = await axios.post(USER_REGISTER_URL, payload);
      // --- Simpan nama user ke localStorage kalau ada di response
      const name = res?.data?.data?.name || payload.name || "User";
      localStorage.setItem("userName", name);
      set({ isLoading: false, isSuccess: true });
    } catch (err) {
      set({ isLoading: false, error: extractErrorMessage(err), isSuccess: false });
    }
  },
}));

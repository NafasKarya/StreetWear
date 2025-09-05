import { ADMIN_CREATE_ACCESS_CODE_URL } from '@/config/api-endpoints';
import { create } from 'zustand';
import axios, { AxiosError } from 'axios';

type CreateAccessCodePayload = {
  code: string;
};

type AccessCodeResponse = {
  id: number;
  code: string;
  created_at: string;
};

type AccessCodeAdminStore = {
  loading: boolean;
  error: string | null;
  data: AccessCodeResponse | null;
  createAccessCode: (payload: CreateAccessCodePayload, token?: string) => Promise<void>;
  reset: () => void;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Ambil pesan error asli dari response kalau ada
    if (error.response?.data?.message) return error.response.data.message;
    if (typeof error.response?.data === 'string') return error.response.data;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Unknown error';
}

export const useAccessCodeAdminStore = create<AccessCodeAdminStore>((set) => ({
  loading: false,
  error: null,
  data: null,

  async createAccessCode(payload, tokenArg) {
    set({ loading: true, error: null });

    // Ambil token: dari argumen > localStorage
    const token = tokenArg || localStorage.getItem('token');
    if (!token) {
      set({ loading: false, error: 'Token admin tidak ditemukan. Silakan login ulang.' });
      return;
    }

    try {
      const { data } = await axios.post<AccessCodeResponse>(
        ADMIN_CREATE_ACCESS_CODE_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      set({ data, loading: false, error: null });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  reset: () => set({ error: null, loading: false, data: null }),
}));

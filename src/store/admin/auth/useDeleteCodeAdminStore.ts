import { ADMIN_DELETE_ACCESS_CODE_URL } from '@/config/api-endpoints';
import { create } from 'zustand';
import axios from 'axios';

type DeleteAccessCodePayload = {
  code: string; // WAJIB, bukan id
};

type DeleteAccessCodeResponse = {
  message?: string;
  [key: string]: any;
};

type DeleteCodeAdminStore = {
  loading: boolean;
  error: string | null;
  success: string | null;
  data: DeleteAccessCodeResponse | null;
  deleteAccessCode: (
    payload: DeleteAccessCodePayload,
    token?: string
  ) => Promise<void>;
  reset: () => void;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) return error.response.data.error;
    if (error.response?.data?.message) return error.response.data.message;
    if (typeof error.response?.data === 'string') return error.response.data;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Unknown error';
}

function getSuccessMessage(data: unknown): string {
  if (data && typeof data === 'object' && 'message' in data) {
    return (data as any).message as string;
  }
  return 'Berhasil hapus access code.';
}

export const useDeleteCodeAdminStore = create<DeleteCodeAdminStore>((set) => ({
  loading: false,
  error: null,
  success: null,
  data: null,

  async deleteAccessCode(payload, tokenArg) {
    set({ loading: true, error: null, success: null });
    const token = tokenArg || localStorage.getItem('token');
    if (!token) {
      set({
        loading: false,
        error: 'Token admin tidak ditemukan. Silakan login ulang.',
      });
      return;
    }
    try {
      const { data } = await axios.delete(ADMIN_DELETE_ACCESS_CODE_URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data: payload, // axios DELETE bisa kirim body lewat data
      });
      set({
        data,
        loading: false,
        error: null,
        success: getSuccessMessage(data),
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
        loading: false,
        success: null,
      });
    }
  },

  reset: () =>
    set({ loading: false, error: null, data: null, success: null }),
}));

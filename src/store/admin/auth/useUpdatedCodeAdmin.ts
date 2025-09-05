
import { create } from 'zustand';
import axios from 'axios';
import { ADMIN_UPDATED_ACCESS_CODE_URL } from '@/config/api-endpoints';

type UpdateAccessCodeByCodePayload = {
  old_code: string;
  new_code: string;
  active?: boolean;
  expired_at?: string;
};

type AccessCodeUpdateResponse = {
  code: string;
  updated_at: string;
  message?: string;
  [key: string]: any;
};

type UpdatedCodeAdminStore = {
  loading: boolean;
  error: string | null;
  success: string | null;
  data: AccessCodeUpdateResponse | null;
  updateAccessCode: (
    payload: UpdateAccessCodeByCodePayload,
    token?: string
  ) => Promise<void>;
  reset: () => void;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
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
  return 'Berhasil update access code.';
}

export const useUpdatedCodeAdmin = create<UpdatedCodeAdminStore>((set) => ({
  loading: false,
  error: null,
  success: null,
  data: null,

  async updateAccessCode(payload, tokenArg) {
    set({ loading: true, error: null, success: null });

    const token = tokenArg || localStorage.getItem('token');
    if (!token) {
      set({ loading: false, error: 'Token admin tidak ditemukan. Silakan login ulang.' });
      return;
    }

    try {
      const { data } = await axios.patch<AccessCodeUpdateResponse>(
        ADMIN_UPDATED_ACCESS_CODE_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

  reset: () => set({ loading: false, error: null, data: null, success: null }),
}));

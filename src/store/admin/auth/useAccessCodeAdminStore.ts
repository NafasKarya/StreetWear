import { ADMIN_CREATE_ACCESS_CODE_URL } from '@/config/api-endpoints';
import { create } from 'zustand';

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
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Unknown error';
}

export const useAccessCodeAdminStore = create<AccessCodeAdminStore>((set) => ({
  loading: false,
  error: null,
  data: null,

  async createAccessCode(payload, tokenArg) {
    set({ loading: true, error: null });

    // Dapatkan token dari argumen kalau ada, fallback ke localStorage
    const token = tokenArg || localStorage.getItem('token');
    if (!token) {
      console.error('TOKEN ADMIN GAK ADA');
      set({ loading: false, error: 'Token admin tidak ditemukan. Silakan login ulang.' });
      return;
    }

    try {
      const res = await fetch(ADMIN_CREATE_ACCESS_CODE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type');

      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const err = await res.json();
          throw new Error(err.message || 'Gagal membuat access code');
        } else {
          const text = await res.text();
          console.error('RESPON GAK JSON:', text.slice(0, 200));
          throw new Error('Respon server tidak valid. Kemungkinan redirect atau HTML.');
        }
      }

      const data: AccessCodeResponse = await res.json();
      set({ data, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  reset: () => set({ error: null, loading: false, data: null }),
}));

import { create } from 'zustand';

export const ADMIN_CREATE_ACCESS_CODE_URL = 'http://127.0.0.1:8000/api/admin/access-code';

type CreateAccessCodePayload = {
  code: string;
  // tambah field lain jika perlu
};

type AccessCodeResponse = {
  id: number;
  code: string;
  created_at: string;
  // tambahkan jika ada struktur lain dari API
};

type AccessCodeAdminStore = {
  loading: boolean;
  error: string | null;
  data: AccessCodeResponse | null;
  createAccessCode: (payload: CreateAccessCodePayload, token: string) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Unknown error';
}

export const useAccessCodeAdminStore = create<AccessCodeAdminStore>((set) => ({
  loading: false,
  error: null,
  data: null,

  async createAccessCode(payload, token) {
    set({ loading: true, error: null });
    try {
      const res = await fetch(ADMIN_CREATE_ACCESS_CODE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create access code');
      }
      const data: AccessCodeResponse = await res.json();
      set({ data, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },
}));

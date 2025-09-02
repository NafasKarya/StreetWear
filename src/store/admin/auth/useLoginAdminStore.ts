import { create } from 'zustand';
import { ADMIN_LOGIN_URL } from '@/config/api-endpoints';

export interface LoginAdminPayload {
  credential: string; // bisa username atau email
  password: string;
}

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

interface LoginAdminState {
  loading: boolean;
  error: string | null;
  success: boolean;
  token: string | null; // kalau backend ngasih token
  login: (data: LoginAdminPayload) => Promise<void>;
  reset: () => void;
}

function isErrorResponse(val: unknown): val is ErrorResponse {
  return (
    typeof val === 'object' &&
    val !== null &&
    'message' in val &&
    typeof (val as { message: unknown }).message === 'string'
  );
}

function extractError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "Terjadi kesalahan tidak diketahui";
}

export const useLoginAdminStore = create<LoginAdminState>((set) => ({
  loading: false,
  error: null,
  success: false,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null, // Ambil token saat init

  login: async (data) => {
    set({ loading: true, error: null, success: false });
    try {
      const response = await fetch(ADMIN_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: data.credential,
          password: data.password,
        }),
      });

      const resJson = await response.json().catch(() => null);

      if (!response.ok) {
        const message = isErrorResponse(resJson)
          ? resJson.message
          : 'Login failed';
        throw new Error(message);
      }

      if (typeof window !== "undefined" && resJson?.token) {
        localStorage.setItem("token", resJson.token);
      }

      set({
        loading: false,
        success: true,
        token: resJson?.token || null
      });
    } catch (err) {
      set({ loading: false, error: extractError(err), success: false, token: null });
    }
  },

  // RESET YANG BENER: hapus localStorage token juga!
  reset: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ error: null, success: false, loading: false, token: null });
  },
}));

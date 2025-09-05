import { create } from 'zustand';
import { ADMIN_REGISTER_URL } from '@/config/api-endpoints';

interface RegisterAdminPayload {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

interface RegisterState {
  loading: boolean;
  error: string | null;
  success: boolean;
  register: (data: RegisterAdminPayload) => Promise<void>;
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

export const useRegisterStore = create<RegisterState>((set) => ({
  loading: false,
  error: null,
  success: false,
  register: async (data: RegisterAdminPayload) => {
    set({ loading: true, error: null, success: false });
    try {
      const response = await fetch(ADMIN_REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // <== INI PENTING
        body: JSON.stringify(data),
      });

      const resJson = await response.json().catch(() => null);

      if (!response.ok) {
        const message = isErrorResponse(resJson)
          ? resJson.message
          : 'Register failed';
        throw new Error(message);
      }

      set({ loading: false, success: true });
    } catch (err) {
      set({ loading: false, error: extractError(err), success: false });
    }
  },
  reset: () => set({ error: null, success: false, loading: false }),
}));

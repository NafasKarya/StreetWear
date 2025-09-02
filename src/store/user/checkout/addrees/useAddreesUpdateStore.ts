import { create } from 'zustand';
import axios from 'axios';

// Tipe field address sesuai backend (snake_case)
export type AddressUpdatePayload = {
  receiver_name?: string;
  phone?: string;
  address_line?: string;
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
  postal_code?: string;
};

type AddressUpdateState = {
  loading: boolean;
  error: string | null;
  success: boolean;
  updateAddress: (uuid: string, payload: AddressUpdatePayload) => Promise<void>;
  resetStatus: () => void;
};

export const useAddressUpdateStore = create<AddressUpdateState>((set) => ({
  loading: false,
  error: null,
  success: false,

  resetStatus: () => set({ error: null, success: false }),

  updateAddress: async (uuid, payload) => {
    set({ loading: true, error: null, success: false });
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem('user_token') : null;
      if (!token) throw new Error('Token tidak ditemukan. Silakan login dulu.');

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.nafaskarya.my.id';
      const url = `${baseUrl}/api/checkout/addresses/${uuid}`;

      await axios.patch(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      set({ loading: false, error: null, success: true });
    } catch (err: any) {
      let errorMsg = 'Unknown error';
      if (err.response?.status === 422 && err.response?.data?.errors) {
        // Laravel validasi error
        const errors = err.response.data.errors;
        errorMsg = Object.values(errors).flat().join(', ');
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      set({ loading: false, error: errorMsg, success: false });
    }
  },
}));

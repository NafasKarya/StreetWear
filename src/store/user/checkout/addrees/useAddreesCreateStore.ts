import { create } from 'zustand';
import axios from 'axios';

export const USER_CREATE_ADDRESS_URL = 'https://api.nafaskarya.my.id/api/checkout/addresses';

// ⛔ Pakai field sesuai backend (snake_case)
export type AddressPayload = {
  receiver_name: string;
  phone: string;
  address_line: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  postal_code: string;
};

type AddressCreateState = {
  loading: boolean;
  error: string | null;
  success: boolean;
  createAddress: (payload: AddressPayload) => Promise<void>;
  resetStatus: () => void;
};

export const useAddressCreateStore = create<AddressCreateState>((set) => ({
  loading: false,
  error: null,
  success: false,

  resetStatus: () => set({ error: null, success: false }),

  createAddress: async (payload: AddressPayload) => {
    set({ loading: true, error: null, success: false });
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem('user_token') : null;
      if (!token) throw new Error('Token tidak ditemukan. Silakan login dulu.');

      // Kirim snake_case field persis kayak backend!
      const res = await axios.post(USER_CREATE_ADDRESS_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      set({ loading: false, error: null, success: true });
    } catch (err: any) {
      let errorMsg = 'Unknown error';
      // Handle Laravel validation error 422
      if (err.response?.status === 422 && err.response?.data?.errors) {
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

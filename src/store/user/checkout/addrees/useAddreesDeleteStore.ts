import { create } from 'zustand';
import axios from 'axios';

type AddressDeleteState = {
  loading: boolean;
  error: string | null;
  success: boolean;
  deleteAddress: (uuid: string) => Promise<void>;
  resetStatus: () => void;
};

export const useAddressDeleteStore = create<AddressDeleteState>((set) => ({
  loading: false,
  error: null,
  success: false,

  resetStatus: () => set({ error: null, success: false }),

  deleteAddress: async (uuid: string) => {
    set({ loading: true, error: null, success: false });
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      if (!token) throw new Error('Token tidak ditemukan. Silakan login dulu.');

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.nafaskarya.my.id';
      const url = `${baseUrl}/api/checkout/addresses/${uuid}`;

      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      set({ loading: false, error: null, success: true });
    } catch (err: any) {
      let errorMsg = 'Unknown error';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      set({ loading: false, error: errorMsg, success: false });
    }
  },
}));

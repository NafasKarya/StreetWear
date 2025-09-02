import { create } from 'zustand';
import axios from 'axios';

export const USER_SEARCH_DESTINATION_URL = 'https://api.nafaskarya.my.id/api/wilayah/provinces';

type Province = {
  code: string;
  name: string;
  // Kalau ada field lain, tambahin di sini
};

type SearchDestinationState = {
  provinces: Province[];
  loading: boolean;
  error: string | null;
  fetchProvinces: () => Promise<void>;
};

export const useSearchDestinationStore = create<SearchDestinationState>((set) => ({
  provinces: [],
  loading: false,
  error: null,

  fetchProvinces: async () => {
    set({ loading: true, error: null });
    try {
      // Ambil token sesuai login lo (user_token)
      const token = typeof window !== "undefined" ? localStorage.getItem('user_token') : null;
      if (!token) throw new Error('Token tidak ditemukan. Silakan login dulu.');

      const res = await axios.get(USER_SEARCH_DESTINATION_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ambil array dari res.data.data, fallback ke []
      const provincesData = Array.isArray(res.data?.data) ? res.data.data : [];
      set({ provinces: provincesData, loading: false, error: null });
    } catch (err: any) {
      let errorMsg = 'Unknown error';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      set({ error: errorMsg, loading: false, provinces: [] }); // fallback ke array
    }
  },
}));

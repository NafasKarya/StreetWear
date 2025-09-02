// store/user/checkout/useSearchVillageStore.ts

import { create } from 'zustand';
import axios from 'axios';

type Village = {
  code: string;
  name: string;
  // Tambah field lain kalau backend lo ada
};

type SearchVillageState = {
  villages: Village[];
  loading: boolean;
  error: string | null;
  fetchVillages: (districtCode: string) => Promise<void>;
};

export const useSearchVillageStore = create<SearchVillageState>((set) => ({
  villages: [],
  loading: false,
  error: null,

  fetchVillages: async (districtCode: string) => {
    set({ loading: true, error: null });
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem('user_token') : null;
      if (!token) throw new Error('Token tidak ditemukan. Silakan login dulu.');

      // Endpoint ID dinamis dari argumen, bukan hardcode
      const url = `https://api.nafaskarya.my.id/api/wilayah/villages/${districtCode}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Asumsi response: { data: [...] }
      const villageList = Array.isArray(res.data?.data) ? res.data.data : [];
      set({ villages: villageList, loading: false, error: null });
    } catch (err: any) {
      let errorMsg = 'Unknown error';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      set({ error: errorMsg, loading: false, villages: [] });
    }
  },
}));

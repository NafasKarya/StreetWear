import { create } from 'zustand';
import axios from 'axios';

type District = {
  code: string;
  name: string;
  // Tambahin field lain dari backend kalau ada
};

type SearchDistrictsState = {
  districts: District[];
  loading: boolean;
  error: string | null;
  fetchDistricts: (regencyCode: string) => Promise<void>;
};

export const useSearchDistrictsStore = create<SearchDistrictsState>((set) => ({
  districts: [],
  loading: false,
  error: null,

  fetchDistricts: async (regencyCode: string) => {
    set({ loading: true, error: null });
    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      if (!token) throw new Error('Token tidak ditemukan. Silakan login dulu.');

      // Endpoint pake kode regency yang dikirim dari argumen
      const url = `https://api.nafaskarya.my.id/api/wilayah/districts/${regencyCode}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ambil array dari res.data.data, fallback ke []
      const districtsData = Array.isArray(res.data?.data) ? res.data.data : [];
      set({ districts: districtsData, loading: false, error: null });
    } catch (err: any) {
      let errorMsg = 'Unknown error';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      set({ error: errorMsg, loading: false, districts: [] });
    }
  },
}));

import { create } from 'zustand';
import axios from 'axios';

type Regency = {
  code: string;
  name: string;
  // Tambah field lain kalau backend ada
};

type SearchRegenciesState = {
  regencies: Regency[];
  loading: boolean;
  error: string | null;
  fetchRegencies: (provinceCode: string) => Promise<void>;
};

export const useSearchRegenciesStore = create<SearchRegenciesState>((set) => ({
  regencies: [],
  loading: false,
  error: null,

  fetchRegencies: async (provinceCode: string) => {
    set({ loading: true, error: null });
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem('user_token') : null;
      if (!token) throw new Error('Token tidak ditemukan. Silakan login dulu.');

      // Bikin endpoint sesuai provinceCode user pilih
      const url = `http://127.0.0.1:8000/api/wilayah/regencies/${provinceCode}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Asumsi response: { data: [...] }
      const regencyList = Array.isArray(res.data?.data) ? res.data.data : [];
      set({ regencies: regencyList, loading: false, error: null });
    } catch (err: any) {
      let errorMsg = 'Unknown error';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      set({ error: errorMsg, loading: false, regencies: [] });
    }
  },
}));

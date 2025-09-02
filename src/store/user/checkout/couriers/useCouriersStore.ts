// store/user/checkout/useCouriersStore.ts

import { create } from "zustand";
import axios from "axios";

export const USER_COURIERS_URL = 'https://api.nafaskarya.my.id/api/couriers';

export type Courier = {
  id: string;
  code: string;
  name: string;
  status: boolean;
  // tambahin field lain kalau backend lo ada
};

interface CouriersStore {
  couriers: Courier[];
  loading: boolean;
  error: string | null;
  fetchCouriers: () => Promise<void>;
}

export const useCouriersStore = create<CouriersStore>((set) => ({
  couriers: [],
  loading: false,
  error: null,
  fetchCouriers: async () => {
    set({ loading: true, error: null });
    try {
      // ambil token dari localStorage (user_token), kalau nggak ada bebasin aja (opsional)
      const token = typeof window !== "undefined" ? localStorage.getItem('user_token') : null;
      const res = await axios.get(USER_COURIERS_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const couriersData = Array.isArray(res.data?.data) ? res.data.data : [];
      set({ couriers: couriersData, loading: false, error: null });
    } catch (err: any) {
      let errorMsg = "Unknown error";
      if (err.response?.data?.message) errorMsg = err.response.data.message;
      else if (err.message) errorMsg = err.message;
      set({ error: errorMsg, loading: false, couriers: [] });
    }
  }
}));

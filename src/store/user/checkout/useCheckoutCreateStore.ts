import { create } from "zustand";
import axios from "axios";

export const USER_CHECKOUT_URL = 'http://127.0.0.1:8000/api/checkout';

type CheckoutPayload = {
  cart_id: number | string;
  receiver_name: string;
  phone: string;
  address_line: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  postal_code: string;
  courier_id: string;
  courier_name: string;
  courier_service: string;
  shipping_fee_id?: string | null;
  estimated_day: string;
  notes?: string;
};

type CheckoutResponse = any;

interface CheckoutStore {
  loading: boolean;
  error: string | null;
  data: CheckoutResponse | null;
  createCheckout: (payload: CheckoutPayload) => Promise<void>;
  resetStatus: () => void;
}

export const useCheckoutCreateStore = create<CheckoutStore>((set) => ({
  loading: false,
  error: null,
  data: null,
  createCheckout: async (payload) => {
    set({ loading: true, error: null, data: null });
    try {
      // Ambil token dari localStorage pakai key 'user_token'
      const token = typeof window !== "undefined" ? localStorage.getItem("user_token") : null;
      if (!token) throw new Error("Token tidak ditemukan. Silakan login dulu.");

      const res = await axios.post(USER_CHECKOUT_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ data: res.data, loading: false });
    } catch (err: any) {
      let msg = "Terjadi kesalahan.";
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      set({ error: msg, loading: false, data: null });
    }
  },
  resetStatus: () => set({ error: null, data: null, loading: false }),
}));

import { create } from 'zustand';
import axios from 'axios';

type PaymentResponse = {
  success: boolean;
  snapToken: string;
  data: {
    checkout_id: number;
    midtrans_order_id: string;
    snap_token: string;
    gross_amount: number;
    currency: string;
    transaction_status: string;
    updated_at: string;
    created_at: string;
    id: number;
  };
};

type PaymentPayload = {
  checkout_id: number;
  gross_amount: number;
  currency?: string;
};

type PaymentState = {
  data: PaymentResponse | null;
  loading: boolean;
  error: string | null;
  createPayment: (payload: PaymentPayload) => Promise<void>;
  clear: () => void;
};

export const usePaymentStore = create<PaymentState>((set) => ({
  data: null,
  loading: false,
  error: null,

  createPayment: async (payload: PaymentPayload) => {
    set({ loading: true, error: null });
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('user_token')
          : null;
      if (!token) throw new Error('Token tidak ditemukan. Silakan login dulu.');

      const res = await axios.post<PaymentResponse>(
        'https://api.nafaskarya.my.id/api/midtrans/payments',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      set({ data: res.data, loading: false, error: null });
    } catch (err: any) {
      let errorMsg = 'Terjadi kesalahan';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMsg = Object.values(err.response.data.errors)
          .flat()
          .join(', ');
      } else if (err.message) {
        errorMsg = err.message;
      }
      set({ error: errorMsg, loading: false, data: null });
    }
  },

  clear: () => set({ data: null, error: null, loading: false }),
}));

import { create } from 'zustand';
import axios from 'axios';

export const USER_DELETE_CART_URL = 'https://api.nafaskarya.my.id/api/cart';

interface UserCartDeleteState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  deleteCartItem: (cartProductId: string | number) => Promise<void>;
}

export const useUserCartDeleteStore = create<UserCartDeleteState>((set) => ({
  isLoading: false,
  isSuccess: false,
  error: null,
  deleteCartItem: async (cartProductId) => {
    set({ isLoading: true, isSuccess: false, error: null });
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("user_token") : null;
      await axios.delete(`${USER_DELETE_CART_URL}/${cartProductId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          "Content-Type": "application/json",
        },
      });
      set({ isLoading: false, isSuccess: true, error: null });
    } catch (err: any) {
      let msg = "Gagal menghapus item cart.";
      if (axios.isAxiosError(err)) {
        const resData = err.response?.data;
        // Error langsung dari backend tanpa diubah-ubah
        if (typeof resData === "string") msg = resData;
        else if (typeof resData?.message === "string") msg = resData.message;
        else if (typeof resData?.errors === "object" && resData.errors !== null) {
          msg = Object.values(resData.errors).flat().join(', ');
        } else {
          msg = JSON.stringify(resData);
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      set({ isLoading: false, isSuccess: false, error: msg });
    }
  },
}));

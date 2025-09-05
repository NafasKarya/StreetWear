import { create } from 'zustand';
import axios from 'axios';
import { USER_ACCES_URL } from '@/config/api-endpoints';

interface ActivateCodeState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  message: string | null;
  activateCode: (code: string) => Promise<void>;
}

export const useUserActivateCode = create<ActivateCodeState>((set) => ({
  isLoading: false,
  error: null,
  isSuccess: false,
  message: null,
  activateCode: async (code) => {
    set({ isLoading: true, error: null, isSuccess: false, message: null });
    try {
      const res = await axios.post(
        USER_ACCES_URL,
        { code },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('user_token')}`,
          },
        }
      );
      if (res.data && res.data.token) {
        localStorage.setItem('user_token', res.data.token);
      }
      set({
        isLoading: false,
        isSuccess: true,
        message: 'Yeay! Your web is now unlocked!',
        error: null,
      });
    } catch (err: any) {
      let errMsg = 'Unknown error';
      if (axios.isAxiosError(err)) {
        if (typeof err.response?.data === 'string') {
          errMsg = err.response.data;
        } else if (typeof err.response?.data?.error === 'string') {
          errMsg = err.response.data.error;
        } else if (typeof err.response?.data?.message === 'string') {
          errMsg = err.response.data.message;
        } else {
          errMsg = JSON.stringify(err.response?.data);
        }
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      set({
        isLoading: false,
        error: errMsg,
        isSuccess: false,
        message: null,
      });
    }
  },
}));



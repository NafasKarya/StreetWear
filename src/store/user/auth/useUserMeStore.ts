// store/user/useUserMeStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { USER_ME_URL } from '@/config/api-endpoints';

interface UserMeState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
}

export const useUserMeStore = create<UserMeState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("user_token");
      const res = await axios.get(USER_ME_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ user: res.data.user, isLoading: false });
      // Optional: Save ke localStorage juga
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Failed to fetch user", isLoading: false });
    }
  },
}));

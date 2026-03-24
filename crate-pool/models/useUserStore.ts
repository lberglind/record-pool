import { getCurrentUser } from "@/api/userSource";
import { env } from "@/config/env";
import { create } from "zustand";

interface UserStore {
  user: { email: string; userID: string } | null;
  isLoading: boolean;
  slackAuthUrl: string;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  slackAuthUrl: `${env.apiUrl}/auth/slack`,
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      set({ user: user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));

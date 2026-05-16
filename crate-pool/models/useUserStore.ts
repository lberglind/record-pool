import { getCurrentUser } from "@/api/userSource";
import { env } from "@/config/env";
import { create } from "zustand";
import { User } from "./types";

interface UserStore {
  user: User | null;
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
      console.error("fetchUser failed:", error);
      set({ isLoading: false });
    }
  },
}));

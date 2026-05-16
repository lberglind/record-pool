import { getCurrentUser } from "@/api/userSource";
import { env } from "@/config/env";
import { create } from "zustand";
import { User } from "./types";
// removed unused import

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type UserStore = {
  user: User | null;
  authStatus: AuthStatus;
  slackAuthUrl: string;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  authStatus: "unauthenticated",
  slackAuthUrl: `${env.apiUrl}/auth/slack`,
  fetchUser: async () => {

    // prevent multiple simultaneous fetches
    const { authStatus } = get();
    if (authStatus === "loading" || authStatus === "authenticated") {
      return;
    }

    set({ authStatus: "loading" });
    try {
      const user = await getCurrentUser();
      if (user) {
        set({ user: user, authStatus: "authenticated" });
      } else {
        set({ user: null, authStatus: "unauthenticated" });
      }
    } catch (error) {
      set({ user: null, authStatus: "unauthenticated" });
    }
  },
  logout: async () => {
    set({ authStatus: "loading" });
    try {
      const res = await fetch(`/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        set({ user: null, authStatus: "unauthenticated" });
      } else {
        set({ authStatus: "unauthenticated" });
      }
    } catch (error) {
      set({ authStatus: "unauthenticated" });
    }
  },
}));

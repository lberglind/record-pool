import { getCurrentUser } from "@/api/userSource";
import { logoutAction } from "@/app/logout/actions";
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
  hasFetchedUser: boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  authStatus: "unauthenticated",
  slackAuthUrl: `${env.apiUrl}/auth/slack`,
  hasFetchedUser: false,
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
        set({ user: user, authStatus: "authenticated", hasFetchedUser: true });
      } else {
        set({ user: null, authStatus: "unauthenticated", hasFetchedUser: true });
      }
    } catch (error) {
      set({ user: null, authStatus: "unauthenticated", hasFetchedUser: true });
    }
  },
  logout: async () => {
    set({ authStatus: "loading" });
    try {
      await logoutAction();
      set({ user: null, authStatus: "unauthenticated", hasFetchedUser: true });
    } catch (error) {
      set({ authStatus: "authenticated" });
      console.error("Logout failed", error);
    }
  },
}));

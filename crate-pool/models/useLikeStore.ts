import { create } from "zustand";
import { Track } from "./types";
import { fetchUserLikes, addLike, removeLike } from "@/api/likeSource";


export type LikeStore = {
  likes: Track[];
  isLoading: boolean;
  hasFetched: boolean;
  currentTrack: Track | null;
  error: string | null;
  fetchLikes: () => Promise<void>;
  addLike: (hash: string) => Promise<void>;
  removeLike: (hash: string) => Promise<void>;
  toggleLike: (track: Track) => Promise<void>;
}

export const useLikeStore = create<LikeStore>((set, get) => ({
  likes: [],
  isLoading: false,
  hasFetched: false,
  currentTrack: null,
  error: null,
  fetchLikes: async () => {
    set({ isLoading: true });
    try {
      const tracks = await fetchUserLikes(); // already returns full Track objects now
      console.log("Fetched likes:", tracks);
      set({ likes: tracks, isLoading: false, hasFetched: true });
    } catch (error) {
      set({ isLoading: false, error: "Failed to load liked tracks" });
    }
  },


  addLike: async (hash) => {
    set((state) => ({ likes: [...state.likes, { hash } as Track], error: null }));
    try {
      await addLike(hash);
      console.log("addLike succeeded");  // ← add
      const tracks = await fetchUserLikes();
      console.log("fetchUserLikes after add succeeded:", tracks);  // ← add
      set({ likes: tracks });
    } catch (error) {
      console.error("addLike catch:", error);  // ← add
      const tracks = await fetchUserLikes();
      set({ likes: tracks, error: "Failed to add like" });
    }
  },
  /*
    addLike: async (hash) => {
      set({ error: null });
      try {
        await addLike(hash);
        const tracks = await fetchUserLikes();
        set({ likes: tracks });
      } catch (error) {
        set({ error: "Failed to add like" });
      }
    },
  */

  removeLike: async (hash) => {
    set((state) => ({
      likes: state.likes.filter((t) => t.hash !== hash),  // optimistic remove
    }));
    try {
      await removeLike(hash);
      const tracks = await fetchUserLikes();
      set({ likes: tracks });  // reconcile with real data
    } catch (error) {
      const tracks = await fetchUserLikes();  // revert on error
      set({ likes: tracks, error: "Failed to remove like" });
    }
  },

  /*
 removeLike: async (hash) => {
   set({ error: null });
   try {
     await removeLike(hash);
     const tracks = await fetchUserLikes();
     set({ likes: tracks });
   } catch (error) {
     set({ error: "Failed to remove like" });
   }
 },
 */
  toggleLike: async (track) => {
    const { likes, removeLike, addLike } = get();
    const isLiked = likes.some((t) => t.hash === track.hash);

    if (isLiked) {
      removeLike(track.hash)
    } else {
      addLike(track.hash)
    }
  },
}));

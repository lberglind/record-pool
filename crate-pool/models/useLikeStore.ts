import { create } from "zustand";
import { Track } from "./types";
import { fetchUserLikes, addLike, removeLike } from "@/api/likeSource";

export interface LikeStore {
    likes: Track[];
    isLoading: boolean;
    hasFetched: boolean;
    currentTrack: Track | null;
    setCurrentTrack: (track: Track | null) => void;
    fetchLikes: () => Promise<void>;
    addLike: (hash: string) => Promise<void>;
    removeLike: (hash: string) => Promise<void>;
}

export const useLikeStore = create<LikeStore>((set) => ({
    likes: [],
    isLoading: false,
    hasFetched: false,
    currentTrack: null,
    fetchLikes: async () => {
        set({ isLoading: true });
        try {
            const tracks = await fetchUserLikes(); // already returns full Track objects now
            console.log("Fetched likes:", tracks);
            set({ likes: tracks, isLoading: false, hasFetched: true });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    addLike: async (hash) => {
        set((state) => ({
            likes: [...state.likes, { hash } as Track],  // ← optimistic add
        }));
        try {
            await addLike(hash);
            const tracks = await fetchUserLikes();
            set({ likes: tracks });  // ← reconcile with real data
        } catch (error) {
            const tracks = await fetchUserLikes();  // ← revert on error
            set({ likes: tracks });
        }
    },

    removeLike: async (hash) => {
        set((state) => ({
            likes: state.likes.filter((t) => t.hash !== hash),  // ← optimistic remove
        }));
        try {
            await removeLike(hash);
            const tracks = await fetchUserLikes();
            set({ likes: tracks });  // ← reconcile with real data
        } catch (error) {
            const tracks = await fetchUserLikes();  // ← revert on error
            set({ likes: tracks });
        }
    },
    setCurrentTrack: (track: Track | null) => {
        set({ currentTrack: track });
    },
}));
import { create } from "zustand";
import { Track } from "./types";
import { fetchUserLikes, addLike, removeLike } from "@/api/likeSource";

export interface LikeStore {
    likes: Track[];
    isLoading: boolean;
    fetchLikes: () => Promise<void>;
    addLike: (hash: string) => Promise<void>;
    removeLike: (hash: string) => Promise<void>;
}

export const useLikeStore = create<LikeStore>((set) => ({
    likes: [],
    isLoading: false,

    fetchLikes: async () => {
        set({ isLoading: true });
        try {
            const likes = await fetchUserLikes();
            const tracks = likes.map((like: { user: string, track: string, timestamp: string }) => ({
                hash: like.track,
                title: like.track,
                artist: "",
                duration: 0,
                bpm: 0,
                key: "",
                genre: "",
            }));
            set({ likes: tracks, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    addLike: async (hash) => {
        set({ isLoading: true });
        try {
            await addLike(hash);
            const likes = await fetchUserLikes();
            set({ likes, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    removeLike: async (hash) => {
        set({ isLoading: true });
        try {
            await removeLike(hash);
            const likes = await fetchUserLikes();
            set({ likes, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    },
}));
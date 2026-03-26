import { create } from "zustand";
import { Track } from "./types";
import { search, uploadTrack } from "@/api/trackSource";

export interface TrackStore {
  currentTrack: Track | null;
  tracks: Track[];
  isLoading: boolean;
  hasMore: boolean;
  search: (params: Record<string, string>, append?: boolean) => Promise<void>;
  uploadTrack: (file: File) => Promise<void>;
}

export const useTrackStore = create<TrackStore>((set) => ({
  currentTrack: null,
  tracks: [],
  isLoading: false,
  hasMore: true,
  search: async (params, append = false) => {
    set({ isLoading: true });
    try {
      const tracks = await search(params);
      set({ tracks, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
  uploadTrack: async (file) => {
    set({ isLoading: true });
    try {
      await uploadTrack(file);
      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false });
    }
  },
}))


import { create } from "zustand";
import { Track } from "./types";
import { search, uploadTrack, uploadXML } from "@/api/trackSource";

export interface TrackStore {
  currentTrack: Track | null;
  tracks: Track[];
  isLoading: boolean;
  search: (params: Record<string, string>) => Promise<void>;
  uploadTrack: (file: File) => Promise<void>;
  uploadXML: (file: File) => Promise<void>;
}

export const useTrackStore = create<TrackStore>((set) => ({
  currentTrack: null,
  tracks: [],
  isLoading: false,
  search: async (params) => {
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
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
  uploadXML: async (file) => {
    set({ isLoading: true });
    try {
      await uploadXML(file);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}))


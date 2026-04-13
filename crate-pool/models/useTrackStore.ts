import { create } from "zustand";
import { QueryParams, Track } from "./types";

import { search, uploadTrack, uploadXML } from "@/api/trackSource";


export interface TrackStore {
  currentTrack: Track | null;
  tracks: Track[];
  isLoading: boolean;
  setCurrentTrack: (track: Track | null) => void;
  search: (query: QueryParams) => Promise<void>;
  uploadTrack: (file: File) => Promise<void>;
  uploadXML: (file: File) => Promise<void>;
}

export const useTrackStore = create<TrackStore>((set) => ({
  currentTrack: null,
  tracks: [],
  isLoading: false,
  search: async (query) => {
    set({ isLoading: true });
    try {
      const tracks = await search(query);
      set({ tracks, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }

  },
  setCurrentTrack: (track: Track | null) => {
    set({ currentTrack: track });
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


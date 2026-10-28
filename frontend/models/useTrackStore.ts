import { create } from "zustand";
import { QueryParams, Track } from "./types";

import { downloadTrack as downloadTrackAPI, search as searchAPI, uploadTrack as uploadTrackAPI, uploadXML as uploadXMLAPI } from "@/api/trackSource";


export type TrackStore = {
  currentTrack: Track | null;
  tracks: Track[];
  isLoading: boolean;
  error: string | null;
  setCurrentTrack: (track: Track | null) => void;
  search: (query: QueryParams) => Promise<void>;
  uploadTrack: (file: File) => Promise<void>;
  uploadXML: (file: File) => Promise<void>;
  downloadTrack: (track: Track) => Promise<void>;
}

export const useTrackStore = create<TrackStore>((set) => ({
  currentTrack: null,
  tracks: [],
  isLoading: false,
  error: null,
  search: async (query) => {
    set({ isLoading: true });
    try {
      const tracks: Track[] = await searchAPI(query);
      set({ tracks, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: "Failed to search tracks" });
    }

  },
  setCurrentTrack: (track: Track | null) => {
    set({ currentTrack: track });
  },
  uploadTrack: async (file: File) => {
    set({ isLoading: true });
    try {
      await uploadTrackAPI(file);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: "Failed to upload track" });
      throw new Error("Failed to upload track");
    }
  },
  uploadXML: async (file: File) => {
    set({ isLoading: true });
    try {
      await uploadXMLAPI(file);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: "Failed to upload XML" });
      throw new Error("Failed to upload XML");
    }
  },
  downloadTrack: async (track: Track) => {
    set({ isLoading: true });
    try {
      await downloadTrackAPI(track);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: "Failed to download track" });
      throw new Error("Failed to download track");
    }
  },
}))

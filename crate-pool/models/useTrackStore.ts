import { create } from "zustand";
import { Track } from "./types";

import { search, uploadTrack, uploadXML } from "@/api/trackSource";


export interface TrackStore {
  currentTrack: Track | null;
  tracks: Track[];
  isLoading: boolean;
  setCurrentTrack: (track: Track | null) => void;
  search: (params: Record<string, string>) => Promise<void>;
  uploadTrack: (file: File) => Promise<void>;
  uploadXML: (file: File) => Promise<void>;
}

const mockTracks: Track[] = [
  {
    hash: "8f3a1b2c4d5e6f7g8h9i0j1k2l3m4n5o",
    title: "Neon Horizon",
    artist: "SynthWave Theory",
    duration: 215, // 3:35
    bpm: 112,
    key: "Gm",
    genre: "Synthwave"
  },
  {
    hash: "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
    title: "Midnight Espresso",
    artist: "The Lo-Fi Collective",
    duration: 184, // 3:04
    bpm: 88,
    key: "Cmaj",
    genre: "Lo-Fi Hip Hop"
  },
  {
    hash: "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4",
    title: "Electric Pulse",
    artist: "Voltage Control",
    duration: 420, // 7:00
    bpm: 128,
    key: "A#m",
    genre: "Techno"
  }
];

export const useTrackStore = create<TrackStore>((set) => ({
  currentTrack: null,
  tracks: mockTracks,
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


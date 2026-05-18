import {create} from "zustand";
import {
    Playlist,
    getPlaylists,
    createPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    deletePlaylist,
} from "@/api/playlistSource";

interface PlaylistStore {
    playlists: Playlist[];
    isLoading: boolean;
    playlistMessage: string;
    fetchPlaylists: () => Promise<void>;
    createPlaylist: (name: string) => Promise<void>;
    addTrackToPlaylist: (playlistId: string, trackHash: string) => Promise<void>;
    removeTrackFromPlaylist: (playlistID: string, trackHash: string) => Promise<void>;
    deletePlaylist: (playlistID: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
    playlists: [],
    isLoading: false,
    playlistMessage: "",
    fetchPlaylists: async () => {
        set({isLoading: true});

        try {
            const playlists = await getPlaylists();
            set({ playlists: playlists ?? [], isLoading: false });
        } catch (error) {
            console.error("Failed to fetch playlists:", error);
            set({isLoading: false});
        }
    },

    createPlaylist: async (name: string) => {
        try {
            await createPlaylist(name);
            await get().fetchPlaylists();
        } catch (error) {
            console.error("Failed to create playlist:", error);
        }
    },

    addTrackToPlaylist: async (playlistId: string, trackHash: string) => {
        try {
            await addTrackToPlaylist(playlistId, trackHash);
            set({ playlistMessage: "Track added to playlist!" });
            setTimeout(() => set({ playlistMessage: "" }), 3000);
        } catch (error) {
            console.error("Failed to add track to playlist:", error);
            set({ playlistMessage: "Failed to add track to playlist." });
            setTimeout(() => set({ playlistMessage: "" }), 3000);
        }
    },

    removeTrackFromPlaylist: async (playlistID: string, trackHash: string) => {
        try {
            await removeTrackFromPlaylist(playlistID, trackHash);
            await get().fetchPlaylists();
        } catch (error) {
            console.error("Failed to remove track from playlist:", error);
            set({ playlistMessage: "Failed to remove track from playlist." });
            setTimeout(() => set({ playlistMessage: "" }), 3000);
        }
    },

    deletePlaylist: async (playlistID: string) => {
        try {
            await deletePlaylist(playlistID);
            await get().fetchPlaylists();
        } catch (error) {
            console.error("Failed to delete playlist:", error);
            set({ playlistMessage: "Failed to delete playlist." });
            setTimeout(() => set({ playlistMessage: "" }), 3000);
        }
    },
}));
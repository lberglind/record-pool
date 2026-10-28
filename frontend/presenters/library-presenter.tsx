"use client"

import LibraryView from "@/views/library-view"
import {useEffect, useState} from "react";
import {usePlaylistStore} from "@/models/usePlaylistStore";
import { toast } from "sonner";

export default function LibraryPresenter() {
    const [playlistName, setPlaylistName] = useState("");

    const playlists = usePlaylistStore((state) => state.playlists);
    const isLoading = usePlaylistStore((state) => state.isLoading);
    const fetchPlaylists = usePlaylistStore((state) => state.fetchPlaylists);
    const createPlaylist = usePlaylistStore((state) => state.createPlaylist);
    const removeTrackFromPlaylist = usePlaylistStore((state) => state.removeTrackFromPlaylist);
    const deletePlaylist = usePlaylistStore((state) => state.deletePlaylist);

    useEffect(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

    async function handleCreatePlaylist() {
        if (!playlistName.trim()) {
            return;
        }

        try {
            await createPlaylist(playlistName.trim());
            toast.success("Playlist created");
            setPlaylistName("");
        } catch (error) {
            toast.error("Failed to create playlist");
        }
    }

    async function handleRemoveTrackFromPlaylist(
        playlistID: string,
        trackHash: string
    ) {
        try {
            await removeTrackFromPlaylist(playlistID, trackHash);
            toast.success("Track removed from playlist");
        } catch (error) {
            toast.error("Failed to remove track from playlist");
        }
    }

    async function handleDeletePlaylist(playlistID: string) {
        try {
            await deletePlaylist(playlistID);
            toast.success("Playlist deleted");
        } catch (error) {
            toast.error("Failed to delete playlist");
        }
    }

    return (
        <div className="w-full mx-auto container">
            <h1 className="text-2xl font-bold mb-4">Library</h1>
            <LibraryView
                playlistName={playlistName}
                playlists={playlists}
                isLoading={isLoading}
                onPlaylistNameChange={setPlaylistName}
                onCreatePlaylist={handleCreatePlaylist}
                onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
                onDeletePlaylist={handleDeletePlaylist}
            />
        </div>
    )
}
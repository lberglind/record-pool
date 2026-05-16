"use client"

import LibraryView from "@/views/library-view"
import {useEffect, useState} from "react";
import {usePlaylistStore} from "@/models/usePlaylistStore";

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

        await createPlaylist(playlistName.trim());
        setPlaylistName("");
    }

    async function handleRemoveTrackFromPlaylist(
        playlistID: string,
        trackHash: string
    ) {
        await removeTrackFromPlaylist(playlistID, trackHash);
    }

    async function handleDeletePlaylist(playlistID: string) {
        await deletePlaylist(playlistID);
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
import {env} from "@/config/env";

export interface Playlist {
    playlistID: string;
    name: string;
    isFolder: boolean;
    children?: Playlist[];
    tracks?: {
        artist: string;
        format: string;
        hash: string;
        timeStamp: string;
        title: string;
    }[];
}

export async function getPlaylists() {
    const res = await fetch(`${env.apiUrl}/playlists`, {
        credentials: "include",
        headers: {
            "ngrok-skip-browser-warning": "true",
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch playlists: ${res.status}`);
    }

    const data = await res.json();

    return data ?? [];
}

export async function createPlaylist(name: string) {
    const res = await fetch(`${env.apiUrl}/playlists`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
            name,
            type: "playlist",
        }),
    });

    if (!res.ok) {
        throw new Error(`Failed to create playlist: ${res.status}`);
    }

    return await res.json();
}

export async function addTrackToPlaylist(playlistId: string, trackHash: string) {
    const res = await fetch(`${env.apiUrl}/playlists/${playlistId}/tracks`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
            trackHash: trackHash,
        }),
    });

    if (!res.ok) {
        throw new Error(`Failed to add track to playlist: ${res.status}`);
    }
}

export async function removeTrackFromPlaylist(
    playlistID: string,
    trackHash: string
) {
    const res = await fetch(
        `${env.apiUrl}/playlists/${playlistID}/tracks/${trackHash}`,
        {
            method: "DELETE",
            credentials: "include",
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        }
    );

    if (!res.ok) {
        throw new Error(`Failed to remove track from playlist: ${res.status}`);
    }
}

export async function deletePlaylist(playlistID: string) {
    const res = await fetch(`${env.apiUrl}/playlists/${playlistID}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "ngrok-skip-browser-warning": "true",
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to delete playlist: ${res.status}`);
    }
}
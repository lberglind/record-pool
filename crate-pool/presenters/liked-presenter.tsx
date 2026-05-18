// liked-presenter.tsx
"use client"
import { useLikeStore } from "@/models/useLikeStore";
import { useEffect, useMemo } from "react";
import { useTrackStore } from "@/models/useTrackStore";
import TracksLayoutView from "@/views/tracks-layout-view";
import { usePlaylistStore } from "@/models/usePlaylistStore";
import { toast } from "sonner";
import { Track } from "@/models/types";

export default function LikedPresenter() {
  const currentTrack = useTrackStore((state) => state.currentTrack);
  const isLoading = useTrackStore((state) => state.isLoading);
  const setCurrentTrack = useTrackStore((state) => state.setCurrentTrack);
  const downloadTrack = useTrackStore((state) => state.downloadTrack);
  const error = useTrackStore((state) => state.error);
  const toggleLike = useLikeStore((s) => s.toggleLike);
  const likes = useLikeStore(s => s.likes);
  const likedHashes = useMemo(() => new Set(likes.map(t => t.hash)), [likes]);
  const fetchLikes = useLikeStore(s => s.fetchLikes)
  const playlists = usePlaylistStore(s => s.playlists);
  const addTrackToPlaylist = usePlaylistStore(s => s.addTrackToPlaylist);
  const playlistMessage = usePlaylistStore(s => s.playlistMessage);

  function closeTrackPreview() {
    setCurrentTrack(null);
    console.log("Closed track preview");
  }

  useEffect(() => {
    fetchLikes();
  }, []);

  async function handleToggleLike(track: Track) {
    const wasLiked = likedHashes.has(track.hash);
    try {
      await toggleLike(track);
      toast.success(wasLiked ? `Unliked ${track.title}` : `Liked ${track.title}`);
    } catch (error) {
      toast.error(wasLiked ? `Failed to unlike ${track.title}` : `Failed to like ${track.title}`);
    }
  }

  async function handleTrackDownload(track: Track) {
    try {
      await downloadTrack(track);
      toast.message(`Downloading ${track.title}`);
    } catch (error) {
      toast.error(`Failed to download ${track.title}`);
    }
  }

  async function handleAddToPlaylist(playlistID: string, hash: string) {
    try {
      await addTrackToPlaylist(playlistID, hash)
      toast.success("Added track to playlist");
    } catch (error) {
      toast.error("Failed to add track to playlist");
    }
  }

  return (
    <div className="w-full mx-auto container">
      <h1 className="text-2xl font-bold mb-4">Liked Tracks</h1>
      <TracksLayoutView playlistMessage={playlistMessage} onAddToPlaylist={handleAddToPlaylist} playlists={playlists} isLoading={isLoading} currentTrack={currentTrack} tracks={likes} onPreview={setCurrentTrack}
        handleLike={handleToggleLike} likedHashes={likedHashes} closeTrackPreview={closeTrackPreview} onDownload={handleTrackDownload} error={error} />
    </div>

  );
}

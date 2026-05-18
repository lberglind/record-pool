// liked-presenter.tsx
"use client"
import { useLikeStore } from "@/models/useLikeStore";
import { useEffect, useMemo } from "react";
import { useTrackStore } from "@/models/useTrackStore";
import TracksLayoutView from "@/views/tracks-layout-view";
import { usePlaylistStore } from "@/models/usePlaylistStore";

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
  const onAddToPlaylist = usePlaylistStore(s => s.addTrackToPlaylist);
  const playlistMessage = usePlaylistStore(s => s.playlistMessage);

  function closeTrackPreview() {
    setCurrentTrack(null);
    console.log("Closed track preview");
  }

  useEffect(() => {
    fetchLikes();
  }, []);

  return (
    <div className="w-full mx-auto container">
      <h1 className="text-2xl font-bold mb-4">Liked Tracks</h1>
      <TracksLayoutView playlistMessage={playlistMessage} onAddToPlaylist={onAddToPlaylist} playlists={playlists} isLoading={isLoading} currentTrack={currentTrack} tracks={likes} onPreview={setCurrentTrack}
        handleLike={toggleLike} likedHashes={likedHashes} closeTrackPreview={closeTrackPreview} onDownload={downloadTrack} error={error} />
    </div>

  );
}

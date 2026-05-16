// liked-presenter.tsx
"use client"
import { useLikeStore } from "@/models/useLikeStore";
import { useEffect, useMemo } from "react";
import { useTrackStore } from "@/models/useTrackStore";
import TracksLayoutView from "@/views/tracks-layout-view";

export default function LikedPresenter() {
  const currentTrack = useTrackStore((state) => state.currentTrack);
  const isLoading = useTrackStore((state) => state.isLoading);
  const setCurrentTrack = useTrackStore((state) => state.setCurrentTrack);
  const downloadTrack = useTrackStore((state) => state.downloadTrack);


  const toggleLike = useLikeStore((s) => s.toggleLike);
  const likes = useLikeStore(s => s.likes);
  const likedHashes = useMemo(() => new Set(likes.map(t => t.hash)), [likes]);
  const fetchLikes = useLikeStore(s => s.fetchLikes)

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
      <TracksLayoutView isLoading={isLoading} currentTrack={currentTrack} tracks={likes} onPreview={setCurrentTrack}
        handleLike={toggleLike} likedHashes={likedHashes} closeTrackPreview={closeTrackPreview} onDownload={downloadTrack} />
    </div>

  );
}

"use client";

import TrackCard from "@/components/TrackCard";
import { getTrackPage, Track } from "@/lib/api";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

export function Tracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [cursor, setCursor] = useState<{ date: string; hash: string } | null | undefined>(
    undefined // undefined = haven't loaded yet, null = no more pages
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sentinel element at the bottom of the list — when it enters the
  // viewport the IntersectionObserver fires and loads the next page
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (currentCursor?: { date: string; hash: string }) => {
    setLoading(true);
    setError("");
    try {
      const page = await getTrackPage(currentCursor);
      setTracks((prev) => [...prev, ...page.tracks]);
      setCursor(page.nextCursor); // null means no more pages
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the first page on mount
  useEffect(() => {
    loadPage(undefined);
  }, [loadPage]);

  // Set up the IntersectionObserver — fires whenever the sentinel scrolls into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && cursor && !loading) {
          loadPage(cursor);
        }
      },
      { rootMargin: "200px" } // start loading 200px before the bottom is reached
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, loading, loadPage]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Tracks</h1>
        <Link href="/upload" style={{ padding: "4px 12px", background: "black", color: "white" }}>
          Upload
        </Link>
      </div>

      {tracks.map((track) => (
        <TrackCard key={track.hash} track={track} />
      ))}

      {/* Sentinel — sits just below the last track */}
      <div ref={sentinelRef} />

      {loading && <p style={{ padding: 16, color: "#999" }}>Loading...</p>}
      {error && <p style={{ padding: 16, color: "red" }}>Error: {error}</p>}
      {cursor === null && tracks.length > 0 && (
        <p style={{ padding: 16, color: "#999", textAlign: "center" }}>End of library</p>
      )}
      {cursor === null && tracks.length === 0 && (
        <p style={{ padding: 16 }}>No tracks yet. <Link href="/upload">Upload some.</Link></p>
      )}
    </div>
  );
}

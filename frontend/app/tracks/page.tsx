'use client'

import TrackCard from "@/components/TrackCard";
import { getTracks } from "@/lib/api";
import { useEffect, useState } from "react";

export function Tracks() {
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    getTracks().then(setTracks);
  }, []);
  return (
    <div>
      <h1>Tracks</h1>
      {tracks.map((track: any) => (
        <TrackCard key={track.hash} track={track} />
      ))}
    </div>
  );

}

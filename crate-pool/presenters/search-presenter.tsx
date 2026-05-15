"use client"
import { useQueryParams } from "@/hooks/use-query-params";
import { Track } from "@/models/types";
import { useTrackStore } from "@/models/useTrackStore"; import { useLikeStore } from "@/models/useLikeStore";
import UploadView from "@/views/upload-view";
import { useEffect, useMemo, useState } from "react";
import TracksLayoutView from "@/views/tracks-layout-view";


export default function SearchPresenter() {
  const [currentTrackFile, setCurrentTrackFile] = useState<File | null>(null);
  const [currentXmlFile, setCurrentXmlFile] = useState<File | null>(null);

  // Zustand store for tracks and search state
  const tracks = useTrackStore((state) => state.tracks);
  const currentTrack = useTrackStore((state) => state.currentTrack);
  const isLoading = useTrackStore((state) => state.isLoading);
  const searchTracks = useTrackStore((state) => state.search);
  const uploadTrack = useTrackStore((state) => state.uploadTrack);
  const uploadXML = useTrackStore((state) => state.uploadXML);
  const setCurrentTrack = useTrackStore((state) => state.setCurrentTrack);
  const downloadTrack = useTrackStore((state) => state.downloadTrack);

  // Get query params from URL
  const { query } = useQueryParams();

  console.log("TrackStore state:", { tracks, currentTrack, isLoading });

  // Effect to perform search when query params change
  useEffect(() => {
    console.log("Performing search in useEffect with query:", query);
    searchTracks(query);
  }, [
    searchTracks,
    query.query,
    query.album,
    query.album_artist,
    query.composer,
    query.remixer,
    query.genre,
    query.tonality,
    query.mix,
    query.label,
    query.comments,
    query.user,
    query.min_bpm,
    query.max_bpm,
    query.min_duration,
    query.max_duration,
    query.min_release,
    query.max_release,
    query.min_date_added,
    query.max_date_added,
    query.min_time_stamp,
    query.max_time_stamp,
    query.min_rating,
    query.max_rating,
    query.min_play_count,
    query.max_play_count,
    query.min_bitrate,
    query.max_bitrate,
    query.min_sample_rate,
    query.max_sample_rate,
    query.min_size,
    query.max_size,
    query.page,
    query.limit,
    query.last_timestamp,
    query.last_hash,
  ]);

  async function handleTrackUpload(file: File | null) {
    if (file) {
      await uploadTrack(file);
      await searchTracks({});
    }
  }

  function handleXmlUpload(file: File | null) {
    if (file) {
      uploadXML(file);
    }
  }

  function handleTrackDownload(track: Track) {
    downloadTrack(track)
  }

  function closeTrackPreview() {
    setCurrentTrack(null);
    console.log("Closed track preview");
  }

  function setTrackPreview(track: Track) {
    setCurrentTrack(track);
    console.log("Set current track to", track);
  }

  const toggleLike = useLikeStore(s => s.toggleLike)
  const likes = useLikeStore(s => s.likes);
  const likedHashes = useMemo(() => new Set(likes.map(t => t.hash)), [likes]);


  return (
    <div className="w-full mx-auto container">
      <TracksLayoutView onDownload={handleTrackDownload} isLoading={isLoading} tracks={tracks} currentTrack={currentTrack} onPreview={setTrackPreview} handleLike={toggleLike} likedHashes={likedHashes} closeTrackPreview={closeTrackPreview} />
      <UploadView track={currentTrackFile} onTrackFileChange={setCurrentTrackFile} onTrackUpload={handleTrackUpload}
        xml={currentXmlFile} onXmlFileChange={setCurrentXmlFile} onXmlUpload={handleXmlUpload}
      />
    </div>
  );
}


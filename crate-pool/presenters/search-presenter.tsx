"use client"
import { Spinner } from "@/components/ui/spinner";
import { useQueryParams } from "@/hooks/use-query-params";
import { Track } from "@/models/types";
import { useTrackStore } from "@/models/useTrackStore"; import { useLikeStore } from "@/models/useLikeStore"; import SearchView from "@/views/search-view";
import TrackPreviewView from "@/views/track-preview-view";
import { TracksTableView } from "@/views/tracks-table-view";
import UploadView from "@/views/upload-view";
import { use, useEffect, useState } from "react";

export default function SearchPresenter() {
  const [currentTrackFile, setCurrentTrackFile] = useState<File | null>(null);
  const [currentXmlFile, setCurrentXmlFile] = useState<File | null>(null);
  const likeModel = useLikeStore();

  // Zustand store for tracks and search state
  const tracks = useTrackStore((state) => state.tracks);
  const currentTrack = useTrackStore((state) => state.currentTrack);
  const isLoading = useTrackStore((state) => state.isLoading);
  const searchTracks = useTrackStore((state) => state.search);
  const uploadTrack = useTrackStore((state) => state.uploadTrack);
  const uploadXML = useTrackStore((state) => state.uploadXML);
  const setCurrentTrack = useTrackStore((state) => state.setCurrentTrack);

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

  function closeTrackPreview() {
    setCurrentTrack(null);
    console.log("Closed track preview");
  }

  function setTrackPreview(track: Track) {
    setCurrentTrack(track);
    console.log("Set current track to", track);
  }

  function RenderTrackPreview({ track }: { track: Track }) {
    const isLiked = useLikeStore(state => state.likes.some(like => like.hash === track.hash));
    return (
      <div>
        <TrackPreviewView track={track} onExitPreview={closeTrackPreview} onLike={handleLike} isLiked={isLiked} />
      </div>
    )
  }
  function handleLike(track: Track) {
    const isLiked = likeModel.likes.some((t) => t.hash === track.hash);
    if (isLiked) {
      likeModel.removeLike(track.hash);
    } else {
      likeModel.addLike(track.hash);
    }
  }

  function RenderTracks({ isLoading, tracks, currentTrack }: { isLoading: boolean, tracks: Track[], currentTrack: Track | null }) {
    if (isLoading) {
      return (
        <Spinner />
      );
    }
    return (
      <div className="flex flex-row gap-4 pt-8">
        <TracksTableView tracks={tracks} onPreview={setTrackPreview} />
        {currentTrack && <RenderTrackPreview track={currentTrack} />}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto container">
      <RenderTracks isLoading={isLoading} tracks={tracks} currentTrack={currentTrack} />
      <UploadView track={currentTrackFile} onTrackFileChange={setCurrentTrackFile} onTrackUpload={handleTrackUpload}
        xml={currentXmlFile} onXmlFileChange={setCurrentXmlFile} onXmlUpload={handleXmlUpload}
      />
    </div>
  );
}
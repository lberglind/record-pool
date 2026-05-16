"use client"
import { Spinner } from "@/components/ui/spinner";
import { QueryParams, Track } from "@/models/types";
import { TrackStore } from "@/models/useTrackStore"; import { LikeStore, useLikeStore } from "@/models/useLikeStore";
import TrackPreviewView from "@/views/track-preview-view";
import { TracksTableView } from "@/views/tracks-table-view";
import UploadView from "@/views/upload-view";
import { useEffect, useState } from "react";

interface SearchPresenterProps {
  trackModel: TrackStore;
  likeModel: LikeStore;
  queryParams: QueryParams;
}

export default function SearchPresenter({ trackModel, likeModel, queryParams }: SearchPresenterProps) {
  const [currentTrackFile, setCurrentTrackFile] = useState<File | null>(null);
  const [currentXmlFile, setCurrentXmlFile] = useState<File | null>(null);  

  // Effect to perform search when query params change
  useEffect(() => {
    console.log("Performing search in useEffect with query:", queryParams);
    trackModel.search(queryParams);
  }, [
    trackModel.search,
    queryParams.query,
    queryParams.album,
    queryParams.album_artist,
    queryParams.composer,
    queryParams.remixer,
    queryParams.genre,
    queryParams.tonality,
    queryParams.mix,
    queryParams.label,
    queryParams.comments,
    queryParams.user,
    queryParams.min_bpm,
    queryParams.max_bpm,
    queryParams.min_duration,
    queryParams.max_duration,
    queryParams.min_release,
    queryParams.max_release,
    queryParams.min_date_added,
    queryParams.max_date_added,
    queryParams.min_time_stamp,
    queryParams.max_time_stamp,
    queryParams.min_rating,
    queryParams.max_rating,
    queryParams.min_play_count,
    queryParams.max_play_count,
    queryParams.min_bitrate,
    queryParams.max_bitrate,
    queryParams.min_sample_rate,
    queryParams.max_sample_rate,
    queryParams.min_size,
    queryParams.max_size,
    queryParams.page,
    queryParams.limit,
    queryParams.last_timestamp,
    queryParams.last_hash,
  ]);

  async function handleTrackUpload(file: File | null) {
    if (file) {
      await trackModel.uploadTrack(file);
      await trackModel.search({});
    }
  }

  function handleXmlUpload(file: File | null) {
    if (file) {
      trackModel.uploadXML(file);
    }
  }

  function closeTrackPreview() {
    trackModel.setCurrentTrack(null);
    console.log("Closed track preview");
  }

  function setTrackPreview(track: Track) {
    trackModel.setCurrentTrack(track);
    console.log("Set current track to", track);
  }

  function handleLike(track: Track) {
    const isLiked = likeModel.likes.some((t) => t.hash === track.hash);
    if (isLiked) {
      likeModel.removeLike(track.hash);
    } else {
      likeModel.addLike(track.hash);
    }
  }

  function RenderTrackPreview({ track }: { track: Track }) {
    const isLiked = likeModel.likes.some(like => like.hash === track.hash);
    return (
      <div>
        <TrackPreviewView track={track} onExitPreview={closeTrackPreview} onLike={handleLike} isLiked={isLiked} />
      </div>
    )
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
      <RenderTracks isLoading={trackModel.isLoading} tracks={trackModel.tracks} currentTrack={trackModel.currentTrack} />
      <UploadView track={currentTrackFile} onTrackFileChange={setCurrentTrackFile} onTrackUpload={handleTrackUpload}
        xml={currentXmlFile} onXmlFileChange={setCurrentXmlFile} onXmlUpload={handleXmlUpload}
      />
    </div>
  );
}
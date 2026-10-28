"use client";

import { QueryParams, Track } from "@/models/types";
import { TrackStore } from "@/models/useTrackStore";
import { LikeStore, useLikeStore } from "@/models/useLikeStore";
import UploadView from "@/views/upload-view";
import { usePlaylistStore } from "@/models/usePlaylistStore";
import TracksLayoutView from "@/views/tracks-layout-view";
import { use, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface SearchPresenterProps {
  trackModel: TrackStore;
  likeModel: LikeStore;
  queryParams: QueryParams;
}

export default function SearchPresenter({ trackModel, likeModel, queryParams }: SearchPresenterProps) {
  const [currentTrackFile, setCurrentTrackFile] = useState<File | null>(null);
  const [currentXmlFile, setCurrentXmlFile] = useState<File | null>(null);

  const fetchLikes = useLikeStore(s => s.fetchLikes);

  const playlists = usePlaylistStore((state) => state.playlists);
  const fetchPlaylists = usePlaylistStore((state) => state.fetchPlaylists);
  const addTrackToPlaylist = usePlaylistStore((state) => state.addTrackToPlaylist);
  const playlistMessage = usePlaylistStore((state) => state.playlistMessage);

  useEffect(() => {
    fetchLikes();
  }, []);

  // Effekt som kör sökning när queryParams ändras
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

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  async function handleTrackUpload(file: File | null) {
    if (file) {
      try {
        await trackModel.uploadTrack(file);
        await trackModel.search({});
        toast.success("Track uploaded successfully");
      } catch (error) {
        toast.error("Failed to upload track");
      }
    }
  }

  async function handleXmlUpload(file: File | null) {
    if (file) {
      try {
        await trackModel.uploadXML(file);
        toast.success("XML uploaded successfully");
      } catch (error) {
        toast.error("Failed to upload XML");
      }
    }
  }

  async function handleTrackDownload(track: Track) {
    try {
      await trackModel.downloadTrack(track);
      toast.message(`Downloading ${track.title}`);
    } catch (error) {
      toast.error(`Failed to download ${track.title}`);
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

  // Sparar gillade hashes i ett Set för blixtsnabb lookup i vyn
  const likedHashes = useMemo(
    () => new Set(likeModel.likes.map((t) => t.hash)),
    [likeModel.likes]
  );

  // Wrapper-funktion för att hantera gilla-markeringar via likeModel
  async function handleToggleLike(track: Track) {
    const wasLiked = likedHashes.has(track.hash);
    try {
      await likeModel.toggleLike(track);
      toast.success(wasLiked ? `Unliked ${track.title}` : `Liked ${track.title}`);
    } catch (error) {
      toast.error(wasLiked ? `Failed to unlike ${track.title}` : `Failed to like ${track.title}`);
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
      <TracksLayoutView
        onDownload={handleTrackDownload}
        isLoading={trackModel.isLoading}
        tracks={trackModel.tracks}
        currentTrack={trackModel.currentTrack}
        onPreview={setTrackPreview}
        handleLike={handleToggleLike}
        likedHashes={likedHashes}
        closeTrackPreview={closeTrackPreview}
        error={trackModel.error || likeModel.error}
        onAddToPlaylist={handleAddToPlaylist}
        playlistMessage={playlistMessage}
        playlists={playlists}
      />
      <UploadView
        track={currentTrackFile}
        onTrackFileChange={setCurrentTrackFile}
        onTrackUpload={handleTrackUpload}
        xml={currentXmlFile}
        onXmlFileChange={setCurrentXmlFile}
        onXmlUpload={handleXmlUpload}
      />
    </div>
  );
}

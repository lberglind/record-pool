"use client"
import { Spinner } from "@/components/ui/spinner";
import { useQueryParams } from "@/hooks/use-query-params";
import { Track } from "@/models/types";
import { useTrackStore } from "@/models/useTrackStore";
import SearchView from "@/views/search-view";
import TrackPreviewView from "@/views/track-preview-view";
import { TracksTableView } from "@/views/tracks-table-view";
import UploadView from "@/views/upload-view";
import { useEffect, useState } from "react";

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

  // Get query params from URL
  const {query, setQuery} = useQueryParams();

  // Effect to perform search when query params change
  useEffect(() => {
    console.log("Performing search in useEffect with query:", query);
    searchTracks(query);
  }, [
    searchTracks,
    query.title,
    query.artist,
    query.duration,
    query.bpm,
    query.key,
    query.genre,
    query.page,
    query.pageSize,
    query.sortBy,
    query.sortDirection,
  ]);

  function handleSearch(title: string) {
    setQuery("title", title);
  }


  function handleTrackUpload(file: File | null) {
    if (file) {
      uploadTrack(file);
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
    return (
      <div>
        <TrackPreviewView track={track} onExitPreview={closeTrackPreview} />
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
      <SearchView onSearch={handleSearch} query={query} />
      <RenderTracks isLoading={isLoading} tracks={tracks} currentTrack={currentTrack} />
      <UploadView track={currentTrackFile} onTrackFileChange={setCurrentTrackFile} onTrackUpload={handleTrackUpload}
        xml={currentXmlFile} onXmlFileChange={setCurrentXmlFile} onXmlUpload={handleXmlUpload}

      />
    </div>
  );
}







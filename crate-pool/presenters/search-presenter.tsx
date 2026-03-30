"use client"
import { Spinner } from "@/components/ui/spinner";
import { Track } from "@/models/types";
import { useTrackStore } from "@/models/useTrackStore";
import SearchView from "@/views/search-view";
import TrackPreviewView from "@/views/track-preview-view";
import { TracksTableView } from "@/views/tracks-table-view";
import UploadView from "@/views/upload-view";
import { useState } from "react";

export default function SearchPresenter() {
  const [query, setQuery] = useState("");

  const model = useTrackStore();
  return (
    <div className="w-full mx-auto container">
      <SearchView onSearch={handleSearch} query={query} onQueryChange={setQuery} />
      <RenderTracks isLoading={model.isLoading} tracks={model.tracks} currentTrack={model.currentTrack} />
      <UploadView />
    </div>
  );

  function handleSearch(query: string) {
    model.search({ query: query });
  }

  function closeTrackPreview() {
    model.setCurrentTrack(null);
    console.log("Closed track preview");
  }

  function setTrackPreview(track: Track) {
    model.setCurrentTrack(track);
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

}







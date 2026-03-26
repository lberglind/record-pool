"use client"
import { Spinner } from "@/components/ui/spinner";
import { Track } from "@/models/types";
import { useTrackStore } from "@/models/useTrackStore";
import SearchView from "@/views/search-view";
import { TracksTableView } from "@/views/tracks-table-view";
import UploadView from "@/views/upload-view";
import { useState } from "react";

export default function SearchPresenter() {
  const [query, setQuery] = useState("");
  const model = useTrackStore();
  return (
    <div className="w-full mx-auto container">
      <SearchView onSearch={handleSearch} query={query} onQueryChange={setQuery} />
      <RenderTracks isLoading={model.isLoading} tracks={model.tracks} />
      <UploadView />
    </div>
  );

  function handleSearch(query: string) {
    model.search({ query: query });
  }
}

function RenderTracks({ isLoading, tracks }: { isLoading: boolean, tracks: Track[] }) {
  if (isLoading) {
    return (
      <Spinner />
    );
  }
  return (
    <TracksTableView tracks={tracks} />
  );
}

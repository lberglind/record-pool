"use client"
import { Spinner } from "@/components/ui/spinner";
import { Track } from "@/models/types";
import { TrackStore, useTrackStore } from "@/models/useTrackStore";
import SearchView from "@/views/search-view";
import { TracksTableView } from "@/views/tracks-table-view";
import UploadView from "@/views/upload-view";

export default function searchPresenter() {
  const model = useTrackStore();
  return (
    <div className="w-full mx-auto container">
      <SearchView onSearch={handleSearch} />
      <RenderTracks model={model} />
      <UploadView />
    </div>)

  function handleSearch(query: string) {
    model.search({ query: query })
  }
}

function RenderTracks({ model }: { model: TrackStore }) {
  if (model.isLoading) {
    return (
      <Spinner />
    )
  }
  return (
    <TracksTableView tracks={model.tracks} />
  )
}

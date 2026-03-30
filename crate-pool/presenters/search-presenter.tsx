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
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [currentTrackFile, setCurrentTrackFile] = useState<File | null>(null);
  const [currentXmlFile, setCurrentXmlFile] = useState<File | null>(null);
  const model = useTrackStore();

  function handleSearch(query: string) {
    model.search({ query: query });
  }

  function handleTrackUpload(file: File | null) {
    if (file) {
      model.uploadTrack(file);
    }
  }

  function handleXmlUpload(file: File | null) {
    if (file) {
      model.uploadXML(file);
    }
  }

  return (
    <div className="w-full mx-auto container">
      <SearchView onSearch={handleSearch} query={query} onQueryChange={setQuery} />
      {currentTrack && <TrackPreviewView track={currentTrack} onExitPreview={() => setCurrentTrack(null)} />}
      <RenderTracks isLoading={model.isLoading} tracks={model.tracks} setCurrentTrack={setCurrentTrack} />
      <UploadView track={currentTrackFile} onTrackFileChange={setCurrentTrackFile} onTrackUpload={handleTrackUpload}
        xml={currentXmlFile} onXmlFileChange={setCurrentXmlFile} onXmlUpload={handleXmlUpload}

      />
    </div>
  );
}

function RenderTracks({
  isLoading,
  tracks,
  setCurrentTrack
}: {
  isLoading: boolean,
  tracks: Track[],
  setCurrentTrack: (track: Track | null) => void,
}) {
  if (isLoading) {
    return <Spinner />;
  }
  return (
    <TracksTableView tracks={tracks} onPreview={setCurrentTrack} />
  );
}

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
      <RenderTracks isLoading={model.isLoading} tracks={model.tracks} currentTrack={model.currentTrack} />
      <UploadView track={currentTrackFile} onTrackFileChange={setCurrentTrackFile} onTrackUpload={handleTrackUpload}
        xml={currentXmlFile} onXmlFileChange={setCurrentXmlFile} onXmlUpload={handleXmlUpload}

      />
    </div>
  );
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







"use client"
import { Spinner } from "@/components/ui/spinner";
import { Track } from "@/models/types";
import { useTrackStore } from "@/models/useTrackStore"; import { useLikeStore } from "@/models/useLikeStore"; import SearchView from "@/views/search-view";
import TrackPreviewView from "@/views/track-preview-view";
import { TracksTableView } from "@/views/tracks-table-view";
import UploadView from "@/views/upload-view";
import { use, useEffect, useState } from "react";

export default function SearchPresenter() {
  const [query, setQuery] = useState("");
  const [currentTrackFile, setCurrentTrackFile] = useState<File | null>(null);
  const [currentXmlFile, setCurrentXmlFile] = useState<File | null>(null);
  const model = useTrackStore();
  const likeModel = useLikeStore();

  useEffect(() => {
    model.search({});
  }, []);


  function handleSearch(query: string) {
    model.search({ query: query });
  }

  async function handleTrackUpload(file: File | null) {
    if (file) {
      await model.uploadTrack(file);
      await model.search({});
    }
  }

  function handleXmlUpload(file: File | null) {
    if (file) {
      model.uploadXML(file);
    }
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
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <SearchView onSearch={handleSearch} query={query} onQueryChange={setQuery} />
      <RenderTracks isLoading={model.isLoading} tracks={model.tracks} currentTrack={model.currentTrack} />
      <UploadView track={currentTrackFile} onTrackFileChange={setCurrentTrackFile} onTrackUpload={handleTrackUpload}
        xml={currentXmlFile} onXmlFileChange={setCurrentXmlFile} onXmlUpload={handleXmlUpload}

      />
    </div>
  );
}









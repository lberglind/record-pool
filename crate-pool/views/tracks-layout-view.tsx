import { Spinner } from "@/components/ui/spinner";
import { Track } from "@/models/types";
import TrackPreviewView from "./track-preview-view";
import { TracksTableView } from "./tracks-table-view";

interface TracksLayoutProps {
  isLoading: boolean;
  currentTrack: Track | null;
  tracks: Track[];
  onPreview: (t: Track) => void;
  handleLike: (t: Track) => void;
  likedHashes: Set<string>;
  closeTrackPreview: () => void;
}

export default function TracksLayoutView(props: TracksLayoutProps) {
  if (props.isLoading) {
    return (
      <Spinner />
    );
  }
  return (
    <div className="flex flex-row gap-4 pt-8">
      <TracksTableView tracks={props.tracks} onPreview={props.onPreview} onLike={props.handleLike} likedHashes={props.likedHashes} />
      {props.currentTrack && <TrackPreviewView track={props.currentTrack} onExitPreview={props.closeTrackPreview} onLike={props.handleLike} isLiked={props.likedHashes.has(props.currentTrack.hash)} />}
    </div>
  );
}

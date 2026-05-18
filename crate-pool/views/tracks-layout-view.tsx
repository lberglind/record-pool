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
  onDownload: (t: Track) => void;
  error?: string | null;
}

export default function TracksLayoutView(props: TracksLayoutProps) {
  if (props.isLoading) {
    return (
      <div className="pt-8 w-full flex items-center justify-center">
        Loading tracks... <Spinner className="ml-2" />
      </div>
    );
  }
  return (
    <div className="flex flex-row gap-4 pt-8">
      {props.error && <p className="text-destructive text-sm">{props.error}</p>}
      <TracksTableView tracks={props.tracks} onPreview={props.onPreview} onLike={props.handleLike} likedHashes={props.likedHashes} />
      {props.currentTrack && <TrackPreviewView onDownload={props.onDownload} track={props.currentTrack} onExitPreview={props.closeTrackPreview} onLike={props.handleLike} isLiked={props.likedHashes.has(props.currentTrack.hash)} />}
    </div>
  );
}

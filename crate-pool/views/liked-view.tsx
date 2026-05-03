// liked-view.tsx
import { Track } from "@/models/types";
import { TracksTableView } from "@/views/tracks-table-view";
import { Spinner } from "@/components/ui/spinner";

interface LikedViewProps {
    tracks: Track[];
    isLoading: boolean;
    onRemoveLike: (track: Track) => void;
}

export default function LikedView({ tracks, isLoading, onRemoveLike }: LikedViewProps) {
    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div className="w-full mx-auto container">
            <h1 className="text-2xl font-bold mb-4">Liked Tracks</h1>
            {tracks.length === 0 ? (
                <p className="text-muted-foreground">No liked tracks yet.</p>
            ) : (
                <TracksTableView tracks={tracks} onPreview={onRemoveLike} />
            )}
        </div>
    );
}
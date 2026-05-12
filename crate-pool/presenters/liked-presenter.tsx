// liked-presenter.tsx
"use client"
import { Spinner } from "@/components/ui/spinner";
import { useLikeStore } from "@/models/useLikeStore";
import { Track } from "@/models/types";
import { useEffect } from "react";
import { TracksTableView } from "@/views/tracks-table-view";

export default function LikedPresenter() {
    const model = useLikeStore();

    useEffect(() => {
        model.fetchLikes();
    }, []);

    function setTrackPreview(track: Track) {
        model.setCurrentTrack(track);
        console.log("Set current track to", track);
    }

    return (
        <div className="w-full mx-auto container">
            <h1 className="text-2xl font-bold mb-4">Liked Tracks</h1>
            <TracksTableView tracks={model.likes} onPreview={setTrackPreview} />
        </div>

    );
}

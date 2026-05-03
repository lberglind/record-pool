// liked-presenter.tsx
"use client"
import { useLikeStore } from "@/models/useLikeStore";
import { Track } from "@/models/types";
import { useEffect } from "react";
import LikedView from "@/views/liked-view";

export default function LikedPresenter() {
    const model = useLikeStore();

    useEffect(() => {
        model.fetchLikes();
    }, []);

    function handleRemoveLike(track: Track) {
        model.removeLike(track.hash);
    }

    return (
        <LikedView
            tracks={model.likes}
            isLoading={model.isLoading}
            onRemoveLike={handleRemoveLike}
        />
    );
}
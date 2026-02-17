"use client";

import { downloadTrack } from "@/lib/api";
import { useState } from "react";

export default function DownloadButton({ trackHash }: { trackHash: string }) {
    const [loading, setLoading] = useState(false);

    async function onDownload() {
        setLoading(true);
        await downloadTrack(trackHash)
        setLoading(false);
    }
    return (
        <button
            className="bg-black text-white px-4 py-2"
            onClick={onDownload}
        >
            {loading ? "Downloading.." : "Download Track"}
        </button>
    )
}

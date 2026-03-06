"use client";

import { API_URL } from "@/lib/api";
import { useState } from "react";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleUpload() {
        if (!file) return;

        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        await fetch(`${API_URL}/upload`, {
            method: "POST",
            body: formData,
        });

        setLoading(false);
        alert("Uploaded!");
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">Upload Track</h1>

            <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <button
                onClick={handleUpload}
                className="bg-black text-white px-4 py-2"
            >
                {loading ? "Uploading..." : "Upload"}
            </button>
        </div>
    )
}

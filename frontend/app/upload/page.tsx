"use client";

import { uploadTrack, uploadXML } from "@/lib/api";
import { useState } from "react";

export default function UploadPage() {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 48 }}>
      <UploadTrack />
      <UploadXML />
    </div>
  );
}

function UploadTrack() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setStatus("");
    try {
      const msg = await uploadTrack(file);
      setStatus(`✅ ${msg}`);
    } catch (e: any) {
      setStatus(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontWeight: "bold", marginBottom: 8 }}>Upload Audio Track</h2>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{ marginLeft: 8, padding: "4px 12px" }}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {status && <p style={{ marginTop: 8 }}>{status}</p>}
    </div>
  );
}

function UploadXML() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setStatus("");
    try {
      const msg = await uploadXML(file);
      setStatus(`✅ ${msg}`);
    } catch (e: any) {
      setStatus(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontWeight: "bold", marginBottom: 8 }}>Upload Rekordbox XML</h2>
      <input
        type="file"
        accept=".xml"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{ marginLeft: 8, padding: "4px 12px" }}
      >
        {loading ? "Importing..." : "Import"}
      </button>
      {status && <p style={{ marginTop: 8 }}>{status}</p>}
    </div>
  );
}

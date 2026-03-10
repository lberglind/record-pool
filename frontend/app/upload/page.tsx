"use client";

import { batchUpload, uploadXML, BatchResult } from "@/lib/api";
import { useRef, useState } from "react";

type Tab = "tracks" | "xml";

export default function UploadPage() {
  const [tab, setTab] = useState<Tab>("tracks");

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <h1 style={{ marginBottom: 16 }}>Upload</h1>

      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid #ddd" }}>
        {(["tracks", "xml"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 20px",
              border: "none",
              borderBottom: tab === t ? "2px solid black" : "2px solid transparent",
              background: "none",
              cursor: "pointer",
              fontWeight: tab === t ? "bold" : "normal",
              marginBottom: -2,
            }}
          >
            {t === "tracks" ? "Audio Tracks" : "Rekordbox XML"}
          </button>
        ))}
      </div>

      {tab === "tracks" ? <UploadTracks /> : <UploadXML />}
    </div>
  );
}

function UploadTracks() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // webkitdirectory can't be set as a JSX prop — React strips unknown attributes
  // Set it imperatively on the folder input after the element exists
  const setFolderRef = (el: HTMLInputElement | null) => {
    if (!el) return;
    (folderInputRef as React.MutableRefObject<HTMLInputElement>).current = el;
    el.setAttribute("webkitdirectory", "");
    el.setAttribute("directory", "");
  };

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).filter(isAudioFile);
    setFiles(selected);
    setResults([]);
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await batchUpload(files);
      setResults(res);
    } catch (e: any) {
      setResults([{ name: "—", error: e.message }]);
    } finally {
      setLoading(false);
    }
  }

  const successCount = results.filter((r) => !r.error).length;
  const failCount = results.filter((r) => r.error).length;

  return (
    <div>
      <p style={{ marginBottom: 12, color: "#555" }}>
        Pick individual files or select an entire folder. Non-audio files are filtered out automatically.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <label style={{ padding: "6px 16px", border: "1px solid #ccc", cursor: "pointer" }}>
          Select files
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={onFilesSelected}
            style={{ display: "none" }}
          />
        </label>

        <label style={{ padding: "6px 16px", border: "1px solid #ccc", cursor: "pointer" }}>
          Select folder
          <input
            ref={setFolderRef}
            type="file"
            accept="audio/*"
            onChange={onFilesSelected}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {files.length > 0 && (
        <p style={{ marginBottom: 12, color: "#555" }}>{files.length} audio file(s) ready</p>
      )}

      <button
        onClick={handleUpload}
        disabled={files.length === 0 || loading}
        style={{ padding: "6px 16px" }}
      >
        {loading ? "Uploading..." : `Upload ${files.length > 0 ? files.length : ""} file(s)`}
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p>
            {successCount > 0 && <span style={{ color: "green" }}>✅ {successCount} succeeded</span>}
            {successCount > 0 && failCount > 0 && "  "}
            {failCount > 0 && <span style={{ color: "red" }}>❌ {failCount} failed</span>}
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ddd" }}>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>File</th>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "4px 8px" }}>{r.name}</td>
                  <td style={{ padding: "4px 8px" }}>
                    {r.error
                      ? <span style={{ color: "red" }}>❌ {r.error}</span>
                      : <span style={{ color: "green" }}>✅ {r.hash}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Filter out anything that isn't audio — folders often contain artwork, .nfo, etc.
function isAudioFile(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  // MIME type isn't always set reliably by the OS, fall back to extension
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ["mp3", "flac", "aiff", "aif", "wav", "m4a", "ogg", "opus", "alac"].includes(ext);
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
      <p style={{ marginBottom: 12, color: "#555" }}>
        Export your collection from Rekordbox (File → Export Collection in xml format) and import it here.
        Metadata will be matched automatically when you upload the corresponding audio files.
      </p>

      <input
        type="file"
        accept=".xml"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setStatus("");
        }}
        style={{ display: "block", marginBottom: 12 }}
      />

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{ padding: "6px 16px" }}
      >
        {loading ? "Importing..." : "Import XML"}
      </button>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}

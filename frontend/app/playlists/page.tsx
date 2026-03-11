"use client";

import { useEffect, useState } from "react";
import {
  getPlaylists,
  createPlaylist,
  deletePlaylist,
  removeTrackFromPlaylist,
  type Playlist,
  type Track,
} from "@/lib/api";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<Playlist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isFolder, setIsFolder] = useState(false);
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const data = await getPlaylists();
      setPlaylists(data ?? []);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createPlaylist(newName.trim(), isFolder);
      setNewName("");
      setIsFolder(false);
      await load();
    } catch (e) {
      setError(String(e));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(playlistId: string) {
    if (!confirm("Delete this playlist?")) return;
    try {
      await deletePlaylist(playlistId);
      if (selected?.playlistID === playlistId) setSelected(null);
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleRemoveTrack(playlistId: string, trackHash: string) {
    try {
      await removeTrackFromPlaylist(playlistId, trackHash);
      // Refresh the selected playlist tracks optimistically
      setSelected((prev) =>
        prev
          ? { ...prev, tracks: prev.tracks.filter((t) => t.hash !== trackHash) }
          : prev
      );
      await load();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Playlists</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>dismiss</button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Left: playlist tree */}
        <div className="w-64 shrink-0">
          <form onSubmit={handleCreate} className="mb-4 flex flex-col gap-2">
            <input
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="New playlist name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFolder}
                onChange={(e) => setIsFolder(e.target.checked)}
              />
              Folder
            </label>
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="bg-black text-white text-sm rounded px-3 py-1 disabled:opacity-40"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </form>

          <div className="flex flex-col gap-1">
            {playlists.length === 0 && (
              <p className="text-sm text-gray-400">No playlists yet.</p>
            )}
            {playlists.map((p) => (
              <PlaylistNode
                key={p.playlistID}
                playlist={p}
                selected={selected}
                onSelect={setSelected}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        {/* Right: selected playlist tracks */}
        <div className="flex-1">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  <p className="text-xs text-gray-400">
                    {selected.imported ? "Imported from Rekordbox" : "Manual playlist"}
                    {" · "}{selected.tracks?.length ?? 0} tracks
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(selected.playlistID)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete playlist
                </button>
              </div>

              {selected.tracks?.length === 0 ? (
                <p className="text-sm text-gray-400">No tracks in this playlist.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selected.tracks?.map((track) => (
                    <PlaylistTrackRow
                      key={track.hash}
                      track={track}
                      onRemove={() => handleRemoveTrack(selected.playlistID, track.hash)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">Select a playlist to see its tracks.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PlaylistNode({
  playlist,
  selected,
  onSelect,
  onDelete,
  depth = 0,
}: {
  playlist: Playlist;
  selected: Playlist | null;
  onSelect: (p: Playlist) => void;
  onDelete: (id: string) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = selected?.playlistID === playlist.playlistID;

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <div
        className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer text-sm group ${
          isSelected ? "bg-black text-white" : "hover:bg-gray-100"
        }`}
        onClick={() => {
          if (playlist.isFolder) setOpen((o) => !o);
          else onSelect(playlist);
        }}
      >
        <span className="truncate">
          {playlist.isFolder ? (open ? "▾ " : "▸ ") : "♫ "}
          {playlist.name}
          {playlist.imported && (
            <span className={`ml-1 text-xs ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
              rb
            </span>
          )}
        </span>
        <button
          className={`text-xs opacity-0 group-hover:opacity-100 ml-2 ${
            isSelected ? "text-red-300" : "text-red-400"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(playlist.playlistID);
          }}
        >
          ✕
        </button>
      </div>

      {playlist.isFolder && open && playlist.children?.map((child) => (
        <PlaylistNode
          key={child.playlistID}
          playlist={child}
          selected={selected}
          onSelect={onSelect}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

function PlaylistTrackRow({
  track,
  onRemove,
}: {
  track: Track;
  onRemove: () => void;
}) {
  return (
    <div className="border rounded px-4 py-2 flex items-center justify-between text-sm">
      <span className="font-medium">
        {track.artist} — {track.title}
      </span>
      <button
        onClick={onRemove}
        className="text-xs text-red-400 hover:underline ml-4 shrink-0"
      >
        Remove
      </button>
    </div>
  );
}

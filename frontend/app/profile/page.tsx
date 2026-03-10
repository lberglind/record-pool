"use client";

import { getProfile } from "@/lib/api";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile().then(setProfile).catch((e) => setError(e.message));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!profile) return <p>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>{profile.email}</h1>

      <section style={{ marginTop: 24 }}>
        <h2>My Tracks ({profile.tracks?.length ?? 0})</h2>
        {profile.tracks?.map((t: any) => (
          <div key={t.hash} style={{ padding: "4px 0", borderBottom: "1px solid #eee" }}>
            {t.title} — {t.artist} <small style={{ color: "#999" }}>{t.hash}</small>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>My Playlists ({profile.playlists?.length ?? 0})</h2>
        {profile.playlists?.map((p: any) => (
          <div key={p.playlistId} style={{ marginBottom: 16 }}>
            <strong>{p.name}</strong> ({p.tracks?.length ?? 0} tracks)
            <ul style={{ margin: "4px 0 0 16px" }}>
              {p.tracks?.map((t: any) => (
                <li key={t.hash}>{t.title} — {t.artist}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>My Metadata Versions ({profile.metadata?.length ?? 0})</h2>
        {profile.metadata?.map((m: any, i: number) => (
          <div key={i} style={{ padding: "4px 0", borderBottom: "1px solid #eee" }}>
            {m.trackHash} — BPM: {m.averageBpm} | Key: {m.tonality} | Genre: {m.genre}
          </div>
        ))}
      </section>
    </div>
  );
}

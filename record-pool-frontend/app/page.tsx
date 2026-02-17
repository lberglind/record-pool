import TrackCard from "@/components/TrackCard";
import { getTracks } from "@/lib/api";

export default async function Home() {
    const tracks = await getTracks();
    return (
        <div>
            <h1>Tracks</h1>
            {tracks.map((track: any) => (
                <TrackCard key={track.hash} track={track} />
            ))}
        </div>
    );
}

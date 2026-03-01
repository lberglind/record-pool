import TrackCard from "@/components/TrackCard";
import { getTracks } from "@/lib/api";

export async function Tracks() {
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

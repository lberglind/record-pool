import DownloadButton from "./DownloadButton";

type Track = {
    hash: string;
    format: string;
    title: string;
    artist: string;
    duration: number;
    timeStamp: string;
}

export default function TrackCard({ track }: { track: Track }) {
    // Display upload date correctly
    const displayDate = new Date(track.timeStamp).toLocaleDateString();

    // Display song duration in minutes and seconds
    const minutes = Math.floor(track.duration / 60);
    const seconds = Math.floor(track.duration % 60).toString().padStart(2, '0');
    const songDuration = `${minutes}:${seconds}`;

    return (
        <div className="border p-4 rounded shadow-sm flex justify-between items-center">
            <div className="flex flex-col">
                <h2 className="font-bold">
                    {track.artist} - {track.title}
                </h2>
                <div className="text-sm text-gray-500 flex flex-col">
                    <div className="flex gap-3 items-center">
                        <span>{track.format}</span>
                        {track.duration > 0 && <span>Length: {songDuration}</span>}
                    </div>
                    <div>Uploaded: {displayDate}</div>
                </div>
            </div>
            <DownloadButton trackHash={track.hash} />
        </div>
    );
}

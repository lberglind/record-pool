import TrackPreviewView from "@/views/track-preview-view";

export type Track = {
    name: string;
    artists: {
        name: string;
    }[];
    album: {
        name: string;
        image: string;
    };
    length: number;
    key: string;
    genre: string;
}

const MOCK_TRACK: Track = {
    name: "Levels - Radio Edit",
    artists: [
        {
            name: "Avicii"
        }
    ],
    album: {
        name: "Levels",
        image: "https://placehold.co/400x400.png"
    },
    length: 123,
    key: "C# minor",
    genre: "House"
}

export default function TrackPreviewPresenter() {
    return (
        <div className="w-full max-w-md">
            <TrackPreviewView track={MOCK_TRACK} />
        </div>

    )
}
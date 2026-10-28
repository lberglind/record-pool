import {Playlist} from "@/api/playlistSource";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {X} from "lucide-react";

interface LibraryViewProps {
    playlistName: string;
    playlists: Playlist[];
    isLoading: boolean;
    onPlaylistNameChange: (name: string) => void;
    onCreatePlaylist: () => void;
    onRemoveTrackFromPlaylist: (playlistID: string, trackHash: string) => void;
    onDeletePlaylist: (playlistID: string) => void;
}

export default function LibraryView(props: LibraryViewProps) {
    return (
        <div className="w-full space-y-6">
            <div className="space-y-2">
                <div className="flex gap-2">
                    <Input
                        value={props.playlistName}
                        onChange={(event) => props.onPlaylistNameChange(event.target.value)}
                        placeholder="Enter new playlist name..."
                    />

                    <Button onClick={props.onCreatePlaylist} className="cursor-pointer">
                        Create
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {props.isLoading && (
                    <p className="text-sm text-muted-foreground">Loading playlists...</p>
                )}

                {!props.isLoading && props.playlists.length === 0 && (
                    <p className="text-sm text-muted-foreground">No playlists yet.</p>
                )}

                {props.playlists.map((playlist) => (
                    <Card key={playlist.playlistID}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                {playlist.name} ({playlist.tracks?.length ?? 0})
                            </CardTitle>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                                onClick={() => props.onDeletePlaylist(playlist.playlistID)}
                            >
                                <X className="h-4 w-4"/>
                            </Button>
                        </CardHeader>

                        <CardContent>
                            {playlist.tracks && playlist.tracks.length > 0 ? (
                                <ul className="space-y-2">
                                    {playlist.tracks.map((track) => (
                                        <li
                                            key={track.hash}
                                            className="flex items-center justify-between rounded-md border p-3"
                                        >
                                            <div>
                                                <p className="font-medium">{track.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {track.artist}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">{track.format}</Badge>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        props.onRemoveTrackFromPlaylist(playlist.playlistID, track.hash)
                                                    }
                                                >
                                                    <X className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No tracks in this playlist yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
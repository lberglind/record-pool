import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { secToMin } from "@/lib/utils";
import { Track } from "@/models/types";
import { HeartIcon, X, ListPlus, Badge } from "lucide-react";
import { Playlist } from "@/api/playlistSource";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { bitrateToKB, formatSize } from "@/utils/util";

interface TrackPreviewViewProps {
  track: Track;
  onExitPreview: () => void;
  onLike: (track: Track) => void;
  isLiked: boolean;
  playlists: Playlist[];
  onAddToPlaylist: (playlistID: string, hash: string) => void;
  playlistMessage: string;
  onDownload: (track: Track) => void;
}

export default function TrackPreviewView(props: TrackPreviewViewProps) {
  const track = props.track;

  function toggleLike() {
    console.log("toggled like for:", track.title);
    props.onLike(track);
  }

  function download() {
    console.log("Downloading track:", track.title)
    props.onDownload(track);
  }


  if (!track) {
    return (<Card>
      <CardHeader>
        <CardTitle>Track not found</CardTitle>
      </CardHeader>
    </Card>);
  }

  const trackDetails = [
    { label: "Album: ", value: track.album },
    { label: "Genre:", value: track.genre?.split(/;|\//).join(', ') },
    { label: "Length:", value: `${secToMin(track.duration)} minutes` },
    { label: "BPM:", value: track.bpm },
    { label: "Key:", value: track.tonality },
    { label: "Bitrate:", value: `${bitrateToKB(track.bitrate)} kbps` },
    { label: "File Format:", value: track.format },
    { label: "Size:", value: formatSize(track.size) },
    { label: "Date added:", value: track.date_added },
  ]
  const visibleDetails = trackDetails.filter(detail => detail.value)


  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{track.title || "Unknown Title"}</CardTitle>
        <CardDescription>{track.artist || "Unknown Artist"}</CardDescription>
        <CardAction><Button size="icon-lg" variant="ghost" onClick={props.onExitPreview}><X /></Button></CardAction>
      </CardHeader>
      <CardContent>
        {visibleDetails.map((detail) => (
          <div className="w-full flex justify-between" key={detail.label}>
            <p>{detail.label}</p>
            <p>{detail.value}</p>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="w-full mt-4 cursor-pointer" type="button">
                <ListPlus className="mr-2 h-4 w-4" />
                Add to playlist...
              </Button>
            }
          />

          <DropdownMenuContent className="w-56">
            {props.playlists.length === 0 ? (
              <DropdownMenuItem disabled>
                No playlists available
              </DropdownMenuItem>
            ) : (
              props.playlists.map((playlist) => (
                <DropdownMenuItem
                  key={playlist.playlistID}
                  onClick={() => props.onAddToPlaylist(playlist.playlistID, track.hash)}
                >
                  {playlist.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {props.playlistMessage && (
          <p className="mt-2 text-sm text-muted-foreground">
            {props.playlistMessage}
          </p>
        )}
        <div className="w-full flex gap-4">
          <Button className="flex-grow py-6 mt-4" onClick={download}>Download</Button>
          <Button className="p-6 mt-4" variant={"outline"} onClick={toggleLike}><HeartIcon className={props.isLiked ? "fill-red-500 text-red-500" : ""} /></Button>
        </div>
      </CardFooter>
    </Card >
  );
}

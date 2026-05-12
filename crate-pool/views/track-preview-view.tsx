import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { secToMin } from "@/lib/utils";
import { Track } from "@/models/types";
import { HeartIcon, X } from "lucide-react";

interface TrackPreviewViewProps {
  track: Track;
  onExitPreview: () => void;
  onLike: (track: Track) => void;
  isLiked: boolean;
}

export default function TrackPreviewView(props: TrackPreviewViewProps) {
  const track = props.track;
  function removeFromLibrary() {
    console.log("Placeholder, should remove from library, need endpoint:", track);
  }
  function toggleLike() {
    console.log("toggled like for:", track.title);
    props.onLike(track);
  }
  if (!track) {
    return (<Card>
      <CardHeader>
        <CardTitle>Track not found</CardTitle>
      </CardHeader>
    </Card>);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{track.title}</CardTitle>
        <CardDescription>{track.artist}</CardDescription>
        <CardAction><Button size="icon-lg" variant="ghost" onClick={props.onExitPreview}><X /></Button></CardAction>
      </CardHeader>
      <CardContent className="relative aspect-square w-full">
        <p>Card Content</p>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="w-full flex justify-between">
          <p>Length</p>
          <p>{secToMin(track.duration)} minutes</p>
        </div>
        <div className="w-full flex justify-between">
          <p>Key</p>
          <p>{track.key}</p>
        </div>
        <div className="w-full flex justify-between">
          <p>Genre</p>
          <Badge>{track.genre}</Badge>
        </div>
        <div className="w-full flex gap-4">
          <Button className="flex-grow py-6 mt-4">Download</Button>
          <Button className="p-6 mt-4" variant={"outline"} onClick={toggleLike}><HeartIcon className={props.isLiked ? "fill-red-500 text-red-500" : ""} /></Button>
          <Button className="p-6 mt-4" variant={"outline"} onClick={removeFromLibrary}><X /></Button>
        </div>
      </CardFooter>
    </Card >
  );
}

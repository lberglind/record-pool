import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Track } from "@/models/types";
import { HeartIcon, X } from "lucide-react";

interface TrackPreviewViewProps {
  track: Track;
  onExitPreview: () => void;
}

export default function TrackPreviewView(props: TrackPreviewViewProps) {
  const track = props.track;
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
          <Button className="p-6 mt-4" variant={"outline"}><HeartIcon /></Button>
        </div>
      </CardFooter>
    </Card >
  );
}

function secToMin(total: number) {
  const mins = Math.floor(total / 60)
  const secs = total % 60
  const formatted = `${mins}:${secs.toString().padStart(2, '0')}`
  return formatted
}

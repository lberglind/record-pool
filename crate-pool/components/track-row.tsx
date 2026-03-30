import { Button } from "./ui/button";
import { TableCell, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Eye } from "lucide-react";
import { Track } from "@/models/types";

interface TrackRowProps {
  track: Track;
  onPreview: (track: Track) => void;
}

export function TrackRow(props: TrackRowProps) {
  const track = props.track;
  return (
    <TableRow>
      <TableCell>{track.title || "test title"}</TableCell>
      <TableCell>{track.artist || "test artist"}</TableCell>
      <TableCell>{track.duration}</TableCell>
      <TableCell>{track.bpm}</TableCell>
      <TableCell>{track.tonality}</TableCell>
      <TableCell>
        <div className="flex gap-0.5"> {
          track.genre?.split(/;|\//).map((genre) => (
            <Badge key={genre} >{genre}</Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <Button className="hover:bg-primary/45" onClick={() => props.onPreview(props.track)}><Eye /></Button>
      </TableCell>
    </TableRow>
  )
}

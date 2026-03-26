import { TrackRow } from "@/components/track-row"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Track } from "@/models/types"

interface TracksTableProps {
  tracks: Track[];
  onPreview: (track: Track) => void;
}

export const TracksTableView = (props: TracksTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Artist</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>BPM</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Genre(s)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.tracks?.map((track) => (
          <TrackRow key={track.hash} track={track} onPreview={props.onPreview} />
        ))}
      </TableBody>
    </Table>
  )
}

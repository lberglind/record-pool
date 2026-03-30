import { TrackRow } from "@/components/track-row"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Track } from "@/models/types"

interface TracksTableProps {
  tracks: Track[];

}

export const TracksTableView = ({ tracks }: Props) => {
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

        {tracks?.map((track) => (
          <TrackRow key={track.hash} track={track} />
        ))}
      </TableBody>
    </Table>
  )
}

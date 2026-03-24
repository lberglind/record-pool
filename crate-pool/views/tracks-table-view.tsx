import { TrackRow } from "@/components/track-row"
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Track } from "@/models/types"

interface Props {
  tracks: Track[];
  isLoading: boolean;
}

export const TracksTableView = ({ tracks, isLoading }: Props) => {
  if (isLoading) {
    return <Spinner />
  }
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
        {tracks.map((track) => (
          <TrackRow key={track.hash} track={track} />
        ))}
      </TableBody>
    </Table>
  )
}

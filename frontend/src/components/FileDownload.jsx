import { fileService } from "../services/api"

export function FileDownload(props) {
    return (
        <button onClick={downloadSong}>Download</button>
    )

    function downloadSong() {
        fileService.downloadFile(props.track.hash)
    }
}

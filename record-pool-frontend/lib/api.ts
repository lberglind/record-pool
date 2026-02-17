export const API_URL = "http://localhost:8080"

export async function getTracks() {
    const res = await fetch(`${API_URL}/files`);
    if (!res.ok) {
        throw new Error("Failed to get Tracks");
    }
    return res.json();
}

export function downloadTrack(track: string) {
    const url = `${API_URL}/download?file=${encodeURIComponent(track)}`

    const link = document.createElement('a');

    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

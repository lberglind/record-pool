//export const API_URL = "http://localhost:8080"
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTracks() {
    const res = await fetch(`${API_URL}/tracks`, {
        credentials: "include"
    });
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

export async function getCurrentUser() {
    const res = await fetch(`${API_URL}/me`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
    });

    if (!res.ok) return null;
    return res.json();
}

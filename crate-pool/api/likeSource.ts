import { env } from "@/config/env";

// För att hämta user likes
export async function fetchUserLikes() {
    const options: RequestInit = {
        method: 'GET',
        credentials: "include",
        headers: {
            "ngrok-skip-browser-warning": "true",
        },
    };

    const res = await fetch(`${env.apiUrl}/likes`, options);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch user likes: ${text}`);
    }

    return await res.json();

}

export async function addLike(hash: string) {
    const options: RequestInit = {
        method: 'POST',
        credentials: "include",
        headers: {
            "ngrok-skip-browser-warning": "true",
        },
    };

    const res = await fetch(`${env.apiUrl}/likes/${hash}`, options);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to add like: ${text}`);
    }
    return await res.json();

}

export async function removeLike(hash: string) {
    const options: RequestInit = {
        method: 'DELETE',
        credentials: "include",
        headers: {
            "ngrok-skip-browser-warning": "true",
        },
    };

    const res = await fetch(`${env.apiUrl}/likes/${hash}`, options);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to remove like: ${text}`);
    }
    return await res.json();
}
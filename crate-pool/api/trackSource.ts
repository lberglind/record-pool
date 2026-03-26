import { env } from "@/config/env";

export async function search(searchParams: Record<string, string>) {
  const options: RequestInit = {
    method: 'GET',
    credentials: "include",
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  } as const;

  const queryString = new URLSearchParams(searchParams).toString();

  const res = await fetch(`${env.apiUrl}/search?${queryString}`, options);

  if (!res.ok) {
    throw new Error("Search failed")
  }

  return await res.json();
}

export async function uploadTrack(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const options: RequestInit = {
    method: "POST",
    credentials: "include",
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  } as const;

  const res = await fetch(`${env.apiUrl}/tracks`, options)

  if (!res.ok) {
    throw new Error("Track Upload failed")
  }
  return await res.json();


}

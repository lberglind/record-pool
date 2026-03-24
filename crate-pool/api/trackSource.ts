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

  return res.json();
}

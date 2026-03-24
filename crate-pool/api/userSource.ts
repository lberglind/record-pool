import { env } from "@/config/env";

interface User {
  email: string;
  userID: string;
}

export async function getCurrentUser() {
  const options: RequestInit = {
    credentials: "include",
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  }
  const res = await fetch(`${env.apiUrl}/me`, options);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }
  const data = await res.json();

  return data as User | null;
}

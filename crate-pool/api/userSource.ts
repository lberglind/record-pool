import { env } from "@/config/env";
import { User } from "@/models/types";

export async function getCurrentUser() {
  console.log("API URL:", env.apiUrl);

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

import { env } from "@/config/env";
import { QueryParams, Track } from "@/models/types";

export async function search(query: QueryParams) {
  const options: RequestInit = {
    method: 'GET',
    credentials: "include",
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  } as const;

  const params = { ...query };

  const queryString = new URLSearchParams(params).toString();

  const res = await fetch(`${env.apiUrl}/search?${queryString}`, options);

  if (!res.ok) {
    throw new Error("Search failed")
  }

  return await res.json();
}

export async function fetchNextPage(params: Record<string, string>, lastTrack: Track) {
  const nextParams = { ...params };


  if (lastTrack) {
    nextParams['last_timestamp'] = lastTrack.time_stamp.toISOString();
    nextParams['last_hash'] = lastTrack.hash;
  }

  return search(nextParams);

}

export async function fetchSearchPage(params: Record<string, string>, page: number) {
  const pageParams = { ...params };
  pageParams['page'] = page.toString();

  return search(pageParams);
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
    body: formData,
  } as const;

  const res = await fetch(`${env.apiUrl}/tracks`, options)

  if (!res.ok) {
    throw new Error("Track Upload failed");
  }
  return await res.json();

}

export async function uploadXML(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const options: RequestInit = {
    method: "POST",
    credentials: "include",
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
    body: formData,
  } as const;

  const res = await fetch(`${env.apiUrl}/xml`, options);

  if (!res.ok) {
    throw new Error("XML Upload failed");
  }

  return await res.json();
}

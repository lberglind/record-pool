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


export async function uploadTrack(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
  });
  
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text;
}

export async function batchUpload(files: File[]): Promise<BatchResult[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const res = await fetch(`${API_URL}/upload/batch`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export type BatchResult = {
  name: string;
  hash?: string;
  error?: string;
};

export async function uploadXML(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload/xml`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text;
}

export async function getProfile() {
  const res = await fetch(`${API_URL}/profile`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}


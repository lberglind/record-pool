export interface Track {
  hash: string;
  title: string;
  artist: string;
  duration: number;
  bpm: number;
  key: string;
  genre: string;
}

export interface User {
  userId: string;
  email: string;
  avatar: string;
}

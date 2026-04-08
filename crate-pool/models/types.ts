export interface Track {
  hash: string;
  title: string;
  artist: string;
  duration: number;
  bpm: number;
  key: string;
  genre: string;
}

export type SortDirection = "asc" | "desc";
export type SortBy = "title" | "artist" | "duration" | "bpm" | "key" | "genre";

export interface QueryParams {
  title?: string;
  artist?: string;
  duration?: string;
  bpm?: string;
  key?: string;
  genre?: string;
  page?: string;
  pageSize?: string;
  sortBy?: SortBy;
  sortDirection?: SortDirection;
}
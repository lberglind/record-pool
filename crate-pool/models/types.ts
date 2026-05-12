export interface Track {
  hash: string;
  format: string;
  title: string;
  artist: string;
  album: string;
  album_artist: string;
  bpm: number;
  bitrate: number;
  comments: string;
  composer?: string;
  date_added: string | null;
  duration: number;
  genre: string;
  label: string;
  limit: number | null;
  mix: string;
  page: number | null;
  play_count: number | null;
  rating: number | null;
  release_date: string | null;
  remixer: string;
  sample_rate: number;
  size: number;
  time_stamp: string;
  tonality: string;
  user: string | null;

  // Backward-compatible aliases used by the current UI.
  timeStamp?: string;
  key?: string;
}

export type SearchResult = Track;

export interface QueryParams {
  // Basic search
  query?: string;

  // Metadata filters
  album?: string;
  album_artist?: string;
  composer?: string;
  remixer?: string;
  genre?: string;
  tonality?: string;
  mix?: string;
  label?: string;
  comments?: string;
  user?: string;
  
  // Range queries - BPM
  min_bpm?: string;
  max_bpm?: string;
  
  // Range queries - Duration
  min_duration?: string;
  max_duration?: string;

  // Range queries - Release date
  min_release?: string;
  max_release?: string;
  
  // Range queries - Date Added
  min_date_added?: string;
  max_date_added?: string;
  
  // Range queries - Timestamp
  min_time_stamp?: string;
  max_time_stamp?: string;
  
  // Range queries - Rating
  min_rating?: string;
  max_rating?: string;
  
  // Range queries - Play Count
  min_play_count?: string;
  max_play_count?: string;
  
  // Range queries - File properties
  min_bitrate?: string;
  max_bitrate?: string;
  min_sample_rate?: string;
  max_sample_rate?: string;
  min_size?: string;
  max_size?: string;
  
  // Pagination
  page?: string;
  limit?: string;

  // Cursor pagination
  last_timestamp?: string;
  last_hash?: string;
}

export interface User {
  userId: string;
  email: string;
  avatar: string;
}
export interface User {
  userId: string;
  email: string;
  avatar: string;
}
export interface Track {
  hash: string;
  title: string;
  artist: string;
  format: string;
  timeStamp: string;
}

export interface TrackMetadata {
  trackHash: string;
  album?: string;
  artist?: string;
  averageBpm?: number;
  bitRate?: number;
  comments?: string;
  composer?: string;
  dateAdded?: string;
  duration?: number;
  genre?: string;
  label?: string;
  mix?: string;
  playCount?: number;
  rating?: number;
  remixer?: string;
  sampleRate?: number;
  size?: number;
  timeStamp?: string;
  tonality?: string;
  uploadedBy?: string;
  year?: number;
}

export interface QueryParams {
  // Basic search
  title?: string;
  artist?: string;
  album?: string;
  
  // Metadata filters
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
  
  // Range queries - Year
  min_year?: string;
  max_year?: string;
  
  // Pagination
  page?: string;
  page_size?: string;
  
  // Sorting
  sort_by?: SortBy;
  sort_direction?: SortDirection;
}

export type SortDirection = "asc" | "desc";
export type SortBy = "title" | "artist" | "album" | "genre" | "duration" | "averageBpm" | "rating" | "year";
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
  uploadedBy?: string;
  
  // Range queries - BPM
  minBPM?: string;
  maxBPM?: string;
  
  // Range queries - Duration
  minDuration?: string;
  maxDuration?: string;
  
  // Range queries - Date Added
  minDateAdded?: string;
  maxDateAdded?: string;
  
  // Range queries - Timestamp
  minTimeStamp?: string;
  maxTimeStamp?: string;
  
  // Range queries - Rating
  minRating?: string;
  maxRating?: string;
  
  // Range queries - Play Count
  minPlayCount?: string;
  maxPlayCount?: string;
  
  // Range queries - File properties
  minBitRate?: string;
  maxBitRate?: string;
  minSampleRate?: string;
  maxSampleRate?: string;
  minSize?: string;
  maxSize?: string;
  
  // Range queries - Year
  minYear?: string;
  maxYear?: string;
  
  // Pagination
  page?: string;
  pageSize?: string;
  
  // Sorting
  sortBy?: SortBy;
  sortDirection?: SortDirection;
}

export type SortDirection = "asc" | "desc";
export type SortBy = "title" | "artist" | "album" | "genre" | "duration" | "averageBpm" | "rating" | "year";
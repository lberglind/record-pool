package domain

import (
	"context"
	"record-pool/internal/track"
	"time"
)

type Track struct {
	Hash        string     `json:"hash"`
	Format      string     `json:"format"`
	Artist      string     `json:"artist"`
	Title       string     `json:"title"`
	Album       *string    `json:"album"`
	AlbumArtist *string    `json:"album_artist"`
	Duration    *float64   `json:"duration"`
	Size        *float64   `json:"size"`
	Bitrate     *float64   `json:"bitrate"`
	SampleRate  *float64   `json:"sample_rate"`
	BPM         *float64   `json:"bpm"`
	Genre       *string    `json:"genre"`
	Publisher   *string    `json:"publisher"`
	ReleaseDate *time.Time `json:"release_date"`
	CreatedAt   time.Time  `json:"timeStamp"`
}

type TrackRepository interface {
	ListAllTracks(ctx context.Context) ([]Track, error)
	GetNameAndFormat(ctx context.Context, hash string) (title, format string, err error)
	AddTrack(ctx context.Context, track track.Metadata, size int64) error
	ExecAddTrack(ctx context.Context, track track.ExecMetadata) error
	ListTrackPage(ctx context.Context, lpDate *time.Time, lpHash string, limit int) ([]Track, error)
	GetTrack(ctx context.Context, hash string) (Track, error)
}

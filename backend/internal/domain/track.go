package domain

import (
	"context"
	"record-pool/internal/track"
	"time"
)

type Track struct {
	Hash      string    `json:"hash"`
	Format    string    `json:"format"`
	Title     string    `json:"title"`
	Artist    string    `json:"artist"`
	CreatedAt time.Time `json:"timeStamp"`
}

type TrackRepository interface {
	ListAllTracks(ctx context.Context) ([]Track, error)
	GetNameAndFormat(ctx context.Context, hash string) (title, format string, err error)
	AddTrack(ctx context.Context, track track.Metadata, size int64) error
}

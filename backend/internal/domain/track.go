package domain

import (
	"context"
	"mime/multipart"
	"time"
)

type Track struct {
	Hash      string    `json:"hash"`
	Format    string    `json:"format"`
	Title     string    `json:"title"`
	Artist    string    `json:"artist"`
	Duration  float64   `json:"duration"`
	CreatedAt time.Time `json:"timeStamp"`
}

type TrackRepository interface {
	ListAllTracks(ctx context.Context) ([]Track, error)
	GetNameAndFormat(ctx context.Context, hash string) (title, format string, err error)
	AddTrack(ctx context.Context, file multipart.File, size int64) (string, error)
}

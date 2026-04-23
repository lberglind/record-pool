package domain

import (
	"context"
	"record-pool/internal/track"
	"time"

	"github.com/google/uuid"
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
	ExecAddTrack(ctx context.Context, track track.ExecMetadata) error
	ListTrackPage(ctx context.Context, lpDate *time.Time, lpHash string, limit int) ([]Track, error)
	LikeTrack(ctx context.Context, user uuid.UUID, track string) error
	DeleteTrackLike(ctx context.Context, user uuid.UUID, track string) error
}

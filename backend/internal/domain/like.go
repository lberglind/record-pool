package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Like struct {
	User      uuid.UUID `json:"user"`
	Track     string    `json:"track"`
	Timestamp time.Time `json:"timestamp"`
}

type LikeRepository interface {
	LikeTrack(ctx context.Context, user uuid.UUID, track string) error
	DeleteTrackLike(ctx context.Context, user uuid.UUID, track string) error
	GetTrackLikesForUser(ctx context.Context, user uuid.UUID) ([]Like, error)
}

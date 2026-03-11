package domain

import (
	"context"

	"github.com/google/uuid"
)

type ProfileData struct {
	Email     string          `json:"email"`
	UserID    uuid.UUID       `json:"userID"`
	Tracks    []Track         `json:"tracks"`
	Metadata  []TrackMetadata `json:"metadata"`
	Playlists []Playlist      `json:"Playlist"`
}

type ProfileRepository interface {
	GetProfile(ctx context.Context, userID uuid.UUID) (*ProfileData, error)
}

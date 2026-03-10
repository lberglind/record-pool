package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Playlist struct {
	PlaylistID uuid.UUID `json:"playlistID"`
	Name       string    `json:"name"`
	CreatedAt  time.Time `json:"createdAt"`
	Tracks     []Track   `json:"tracks"`
}

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

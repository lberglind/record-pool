package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Playlist struct {
	PlaylistID uuid.UUID  `json:"playlistID"`
	ParentID   *uuid.UUID `json:"parentID"`
	Name       string     `json:"name"`
	IsFolder   bool       `json:"isFolder"`
	Position   int        `json:"position"`
	Imported   bool       `json:"imported"`
	CreatedAt  time.Time  `json:"createdAt"`
	Children   []Playlist `json:"children,omitempty"`
	Tracks     []Track    `json:"tracks,omitempty"`
}

type PlaylistRepository interface {
	Create(ctx context.Context, userID uuid.UUID, name string, parentID *uuid.UUID, isFolder bool, position int, imported bool) (*Playlist, error)
	GetTree(ctx context.Context, userID uuid.UUID) ([]Playlist, error)
	Get(ctx context.Context, userID, playlistID uuid.UUID) (*Playlist, error)
	AddTrack(ctx context.Context, playlistID uuid.UUID, trackHash string) error
	RemoveTrack(ctx context.Context, playlistID uuid.UUID, trackHash string) error
	Delete(ctx context.Context, userID, playlistID uuid.UUID) error
	DeleteImportedForUser(ctx context.Context, userID uuid.UUID) error
}

package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type XMLStagingEntry struct {
	ID          int
	UploadedBy  uuid.UUID
	RekordboxID int
	Title       string
	Artist      string
	Location    string

	// Mirrors TrackMetadata fields
	BPM        float64
	Tonality   string
	Duration   int
	Album      string
	Comments   string
	Remixer    string
	Label      string
	Mix        string
	Genre      string
	Size       int
	Year       int
	Composer   string
	SampleRate int
	DateAdded  *time.Time
	PlayCount  int
	Rating     int
	Bitrate    int
	CuePoints  []CuePoint
	Beatgrid   []Tempo

	TrackHash string
	SyncedAt  *time.Time
	CreatedAt time.Time
}

type XMLStagingRepository interface {
	// Upsert batch of tracks from an uploaded XML
	UpsertBatch(ctx context.Context, entries []XMLStagingEntry) error

	// Find all unmatched but matchable entries for a user
	FindUnmatchedByTitleArtistSize(ctx context.Context, uploadedBy uuid.UUID) ([]XMLStagingEntry, error)

	// Mark a staging entry as matched to a track hash
	MarkSynced(ctx context.Context, id int, trackHash string) error
}

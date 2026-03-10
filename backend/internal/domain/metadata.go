package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type TrackMetadata struct {
	TrackHash  string     `json:"trackHash"`
	UploadedBy *uuid.UUID `json:"uploadedBy"`
	BPM        float64    `json:"averageBpm"`
	Duration   int        `json:"duration"`
	Album      string     `json:"album"`
	Comments   string     `json:"comments"`
	Remixer    string     `json:"remixer"`
	Label      string     `json:"label"`
	Mix        string     `json:"mix"`
	Genre      string     `json:"genre"`
	Size       int        `json:"size"`
	Year       int        `json:"year"`
	Composer   string     `json:"composer"`
	SampleRate int        `json:"sampleRate"`
	DateAdded  *time.Time `json:"dateAdded"`
	PlayCount  int        `json:"playCount"`
	Rating     int        `json:"rating"`
	BitRate    int        `json:"bitRate"`
	Tonality   string     `json:"tonality"`
	Beatgrid   []Tempo    `json:"beatgrid"`
	CuePoints  []CuePoint `json:"cuePoints"`
	CreatedAt  time.Time  `json:"timeStamp"`
}

type Tempo struct {
	Inizio  float64 `json:"inizio"`
	BPM     float64 `json:"bpm"`
	Metro   string  `json:"metro"`
	Battito int     `json:"battito"`
}

type CuePoint struct {
	Name  string  `json:"name"`
	Type  int     `json:"type"`
	Start float64 `json:"start"`
	Num   int     `json:"num"`
	Red   *int    `json:"red,omitempty"`
	Green *int    `json:"green,omitempty"`
	Blue  *int    `json:"blue,omitempty"`
}

type TrackMetadataRepository interface {
	Upsert(ctx context.Context, meta TrackMetadata) error
	GetForTrack(ctx context.Context, trackHash string, uploadedBy uuid.UUID) (*TrackMetadata, error)
	ListUploadersForTrack(ctx context.Context, trackHash string) ([]TrackMetadata, error)
}

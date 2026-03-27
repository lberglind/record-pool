package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type SearchParams struct {
	Query         string     `schema:"query"`
	UploadedBy    *uuid.UUID `schema:"user"`
	MinBPM        *int       `schema:"min_bpm"`
	MaxBPM        *int       `schema:"max_bpm"`
	MinDuration   *int       `schema:"min_duration"`
	MaxDuration   *int       `schema:"max_duration"`
	Album         string     `schema:"album"`
	AlbumArtist   string     `schema:"album_artist"`
	Comments      string     `schema:"comments"`
	Remixer       string     `schema:"remixer"`
	Label         string     `schema:"label"`
	Mix           string     `schema:"mix"`
	Genre         string     `schema:"genre"`
	MinSize       *int       `schema:"min_size"`
	MaxSize       *int       `schema:"max_size"`
	MinRelease    *time.Time `schema:"min_release"`
	MaxRelease    *time.Time `schema:"max_release"`
	Composer      string     `schema:"composer"`
	MinSampleRate *int       `schema:"min_sample_rate"`
	MaxSampleRate *int       `schema:"max_sample_rate"`
	MinDateAdded  *time.Time `schema:"min_date_added"`
	MaxDateAdded  *time.Time `schema:"max_date_added"`
	MinPlayCount  *int       `schema:"min_play_count"`
	MaxPlayCount  *int       `schema:"max_play_count"`
	MinRating     *int       `schema:"min_rating"`
	MaxRating     *int       `schema:"max_rating"`
	MinBitRate    *int       `schema:"min_bitrate"`
	MaxBitRate    *int       `schema:"max_bitrate"`
	Tonality      string     `schema:"tonality"`
	MinTimeStamp  *time.Time `schema:"min_time_stamp"`
	MaxTimeStamp  *time.Time `schema:"max_time_stamp"`
	Limit         *uint64    `schema:"limit"`
	Page          *uint64    `schema:"page"`
	LastTimeStamp *time.Time `schema:"last_timestamp"`
	LastHash      string     `schema:"last_hash"`
}

type SearchResult struct {
	Hash        string     `json:"hash"`
	Format      string     `json:"format"`
	Title       string     `json:"title"`
	Artist      string     `json:"artist"`
	UploadedBy  *uuid.UUID `json:"user"`
	BPM         *float32   `json:"bpm"`
	Duration    *float64   `json:"duration"`
	Album       string     `json:"album"`
	AlbumArtist string     `json:"album_artist"`
	Comments    string     `json:"comments"`
	Remixer     string     `json:"remixer"`
	Label       string     `json:"label"`
	Mix         string     `json:"mix"`
	Genre       string     `json:"genre"`
	Size        *int       `json:"size"`
	ReleaseDate *time.Time `json:"release_date"`
	Composer    string     `json:"composer"`
	SampleRate  *int       `json:"sample_rate"`
	DateAdded   *time.Time `json:"date_added"`
	PlayCount   *int       `json:"play_count"`
	Rating      *int       `json:"rating"`
	BitRate     *int       `json:"bitrate"`
	Tonality    *string    `json:"tonality"`
	TimeStamp   *time.Time `json:"time_stamp"`
	Limit       *int       `json:"limit"`
	Page        *int       `json:"page"`
}

type SearchResponse struct {
	Results []SearchResult `json:"results"`
	Page    int            `json:"page"`
	Limit   int            `json:"limit"`
	Total   int            `json:"total"`
}

type SearchRepository interface {
	SearchTracks(ctx context.Context, userID uuid.UUID, params SearchParams) ([]SearchResult, error)
}

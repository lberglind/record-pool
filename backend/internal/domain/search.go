package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type SearchParams struct {
	Title         string     `schema:"title"`
	Artist        string     `schema:"artist"`
	UploadedBy    *uuid.UUID `schema:"user"`
	MinBPM        *int       `schema:"min_bpm"`
	MaxBPM        *int       `schema:"max_bpm"`
	MinDuration   *int       `schema:"min_duration"`
	MaxDuration   *int       `schema:"max_duration"`
	Album         string     `schema:"album"`
	Comments      string     `schema:"comments"`
	Remixer       string     `schema:"remixer"`
	Label         string     `schema:"label"`
	Mix           string     `schema:"mix"`
	Genre         string     `schema:"genre"`
	MinSize       *int       `schema:"min_size"`
	MaxSize       *int       `schema:"max_size"`
	MinYear       *int       `schema:"min_year"`
	MaxYear       *int       `schema:"max_year"`
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
	PageSize      *uint64    `schema:"page_size"`
	Page          *uint64    `schema:"page"`
}

type SearchRepository interface {
	SearchTracks(ctx context.Context, params SearchParams) ([]Track, error)
}

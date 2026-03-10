package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"record-pool/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TrackMetadataRepo struct {
	pool *pgxpool.Pool
}

func NewTrackMetadataRepo(pool *pgxpool.Pool) *TrackMetadataRepo {
	return &TrackMetadataRepo{pool: pool}
}

func (r *TrackMetadataRepo) Upsert(ctx context.Context, meta domain.TrackMetadata) error {
	cuePoints, err := json.Marshal(meta.CuePoints)
	if err != nil {
		return fmt.Errorf("failed to marshal cue points: %w", err)
	}
	beatgrid, err := json.Marshal(meta.Beatgrid)
	if err != nil {
		return fmt.Errorf("failed to marshal beatgrid: %w", err)
	}

	query := `INSERT INTO track_metadata 
	(track_hash, uploaded_by, bpm, tonality, duration_seconds, album, comments, remixer, label, mix, genre, year, composer,
		sample_rate, date_added, play_count, rating, bitrate, cue_points, beatgrid)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
		ON CONFLICT (track_hash, uploaded_by)
		DO UPDATE SET
			bpm = EXCLUDED.bpm,
			tonality = EXCLUDED.tonality
			duration = EXCLUDED.duration
			album = EXCLUDED.album
			comments = EXCLUDED.comments
			remixer = EXCLUDED.remixer
			label = EXCLUDED.label
			mix = EXCLUDED.mix
			genre = EXCLUDED.genre
			year = EXCLUDED.year
			composer = EXCLUDED.composer
			sample_rate = EXCLUDED.sample_rate
			date_added = EXCLUDED.date_added
			play_count = EXCLUDED.play_count
			rating = EXCLUDED.rating
			bitrate = EXCLUDED.bitrate,
			cue_points = EXCLUDED.cue_points,
			beatgrid = EXCLUDED.beatgrid,
			created_at = NOW()`

	_, err = r.pool.Exec(ctx, query,
		meta.TrackHash,
		meta.UploadedBy,
		meta.BPM,
		meta.Tonality,
		meta.Duration,
		meta.Album,
		meta.Comments,
		meta.Remixer,
		meta.Label,
		meta.Mix,
		meta.Genre,
		meta.Year,
		meta.Composer,
		meta.SampleRate,
		meta.DateAdded,
		meta.PlayCount,
		meta.Rating,
		meta.BitRate,
		cuePoints,
		beatgrid,
	)
	return err
}

func (r *TrackMetadataRepo) GetForTrack(ctx context.Context, trackHash string, uploadedBy uuid.UUID) (*domain.TrackMetadata, error) {
	query := `SELECT track_hash, uploaded_by, bpm, tonality, duration_seconds, album, comments, remixer,
	label, mix, genre, year, composer, sample_rate, date_added, play_count, rating, bitrate, cue_points, beatgrid, created_at
	FROM track_metadata WHERE track_hash = $1 AND uploaded_by = $2`

	row := r.pool.QueryRow(ctx, query, trackHash, uploadedBy)
	return scanMetadata(row)
}

func (r *TrackMetadataRepo) ListUploadersForTrack(ctx context.Context, trackHash string) ([]domain.TrackMetadata, error) {
	query := `SELECT track_hash, uploaded_by, bpm, tonality, duration_seconds, album, comments, remixer,
	label, mix, genre, year, composer, sample_rate, date_added, play_count, rating, bitrate, cue_points, beatgrid, created_at
	FROM track_metadata WHERE track_hash = $1 ORDER BY created_at DESC`
	rows, err := r.pool.Query(ctx, query, trackHash)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.TrackMetadata
	for rows.Next() {
		meta, err := scanMetadata(rows)
		if err != nil {
			continue
		}
		results = append(results, *meta)
	}
	return results, nil
}

type scanner interface {
	Scan(dest ...any) error
}

func scanMetadata(row scanner) (*domain.TrackMetadata, error) {
	var meta domain.TrackMetadata
	var rawCuePoints, rawBeatgrid []byte

	err := row.Scan(
		&meta.TrackHash,
		&meta.UploadedBy,
		&meta.BPM,
		&meta.Tonality,
		&meta.Duration,
		&meta.Album,
		&meta.Comments,
		&meta.Remixer,
		&meta.Label,
		&meta.Mix,
		&meta.Genre,
		&meta.Year,
		&meta.Composer,
		&meta.SampleRate,
		&meta.DateAdded,
		&meta.PlayCount,
		&meta.Rating,
		&meta.BitRate,
		&rawCuePoints,
		&rawBeatgrid,
		&meta.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(rawCuePoints, &meta.CuePoints); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cue points: %w", err)
	}
	if err := json.Unmarshal(rawBeatgrid, &meta.Beatgrid); err != nil {
		return nil, fmt.Errorf("failed to unmarshal beatgrid: %w", err)
	}

	return &meta, nil
}

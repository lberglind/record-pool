package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"record-pool/internal/domain"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type XMLStagingRepo struct {
	pool *pgxpool.Pool
}

func NewXMLStagingRepo(pool *pgxpool.Pool) *XMLStagingRepo {
	return &XMLStagingRepo{pool: pool}
}

func (r *XMLStagingRepo) UpsertBatch(ctx context.Context, entries []domain.XMLStagingEntry) error {
	for _, e := range entries {
		cuePoints, err := json.Marshal(e.CuePoints)
		if err != nil {
			return fmt.Errorf("failed to marshal cue points for rekordbox_id %d: %w", e.RekordboxID, err)
		}
		beatgrid, err := json.Marshal(e.Beatgrid)
		if err != nil {
			return fmt.Errorf("failed to marshal beatgrid for rekordbox_id %d: %w", e.RekordboxID, err)
		}

		query := `INSERT INTO xml_staging
			(uploaded_by, rekordbox_id, title, artist, location, bpm, tonality, duration_seconds, album,
			comments, remixer, label, mix, genre, size, year, composer, sample_rate, date_added, play_count,
			rating, bitrate, cue_points, beatgrid)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
				$13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
			ON CONFLICT (uploaded_by, rekordbox_id) DO UPDATE SET
				title       = EXCLUDED.title,
				artist      = EXCLUDED.artist,
				location    = EXCLUDED.location,
				bpm         = EXCLUDED.bpm,
				tonality    = EXCLUDED.tonality,
				duration_seconds    = EXCLUDED.duration_seconds,
				album       = EXCLUDED.album,
				comments    = EXCLUDED.comments,
				remixer     = EXCLUDED.remixer,
				label       = EXCLUDED.label,
				mix         = EXCLUDED.mix,
				genre       = EXCLUDED.genre,
				size 				= EXCLUDED.size,
				year        = EXCLUDED.year,
				composer    = EXCLUDED.composer,
				sample_rate = EXCLUDED.sample_rate,
				date_added  = EXCLUDED.date_added,
				play_count  = EXCLUDED.play_count,
				rating      = EXCLUDED.rating,
				bitrate     = EXCLUDED.bitrate,
				cue_points  = EXCLUDED.cue_points,
				beatgrid    = EXCLUDED.beatgrid,
				synced_at   = NULL,
				track_hash  = NULL`

		_, err = r.pool.Exec(ctx, query,
			e.UploadedBy,
			e.RekordboxID,
			e.Title,
			e.Artist,
			e.Location,
			e.BPM,
			e.Tonality,
			e.Duration,
			e.Album,
			e.Comments,
			e.Remixer,
			e.Label,
			e.Mix,
			e.Genre,
			e.Size,
			e.Year,
			e.Composer,
			e.SampleRate,
			e.DateAdded,
			e.PlayCount,
			e.Rating,
			e.Bitrate,
			cuePoints,
			beatgrid,
		)
		if err != nil {
			return fmt.Errorf("failed to upsert rekordbox_id %d: %w", e.RekordboxID, err)
		}
	}
	return nil
}

func (r *XMLStagingRepo) FindUnmatchedByTitleArtistSize(ctx context.Context, uploadedBy uuid.UUID) ([]domain.XMLStagingEntry, error) {
	query := `SELECT s.id, s.uploaded_by, s.rekordbox_id, s.title, s.artist, s.location,
           s.bpm, s.tonality, s.duration_seconds, s.album, s.comments, s.remixer, s.label,
           s.mix, s.genre, s.size, s.year, s.composer, s.sample_rate, s.date_added,
           s.play_count, s.rating, s.bitrate, s.cue_points, s.beatgrid,
           s.synced_at, s.created_at, t.hash
		FROM xml_staging s JOIN tracks t 
		ON LOWER(s.title) = LOWER(t.title) AND LOWER(s.artist) = LOWER(t.artist) AND s.size = t.size
		WHERE s.uploaded_by = $1 AND s.track_hash IS NULL ORDER BY s.created_at DESC`
	rows, err := r.pool.Query(ctx, query, uploadedBy)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanStagingRows(rows)
}

// Mark a staging entry as matched to a track hash
func (r *XMLStagingRepo) MarkSynced(ctx context.Context, id int, trackHash string) error {
	query := `UPDATE xml_staging
		SET track_hash = $1,
		synced_at = $2
		WHERE id = $3`

	_, err := r.pool.Exec(ctx, query, trackHash, time.Now(), id)
	return err
}

func scanStagingRows(rows interface {
	Next() bool
	Scan(dest ...any) error
	Err() error
}) ([]domain.XMLStagingEntry, error) {
	var results []domain.XMLStagingEntry

	for rows.Next() {
		e, err := scanStagingRow(rows)
		if err != nil {
			return nil, err
		}
		results = append(results, *e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return results, nil
}

func scanStagingRow(row interface {
	Scan(dest ...any) error
}) (*domain.XMLStagingEntry, error) {
	var e domain.XMLStagingEntry
	var rawCuePoints, rawBeatgrid []byte

	err := row.Scan(
		&e.ID,
		&e.UploadedBy,
		&e.RekordboxID,
		&e.Title,
		&e.Artist,
		&e.Location,
		&e.BPM,
		&e.Tonality,
		&e.Duration,
		&e.Album,
		&e.Comments,
		&e.Remixer,
		&e.Label,
		&e.Mix,
		&e.Genre,
		&e.Size,
		&e.Year,
		&e.Composer,
		&e.SampleRate,
		&e.DateAdded,
		&e.PlayCount,
		&e.Rating,
		&e.Bitrate,
		&rawCuePoints,
		&rawBeatgrid,
		&e.SyncedAt,
		&e.CreatedAt,
		&e.TrackHash,
	)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(rawCuePoints, &e.CuePoints); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cue_points: %w", err)
	}
	if err := json.Unmarshal(rawBeatgrid, &e.Beatgrid); err != nil {
		return nil, fmt.Errorf("failed to unmarshal beatgrid: %w", err)
	}

	return &e, nil
}

func (r *XMLStagingRepo) HashForRekordboxID(ctx context.Context, userId uuid.UUID, rekordboxID int) (string, error) {
	var hash string
	query := `SELECT track_hash FROM xml_staging WHERE uploaded_by = $1 AND rekordbox_id = $2 AND track_hash IS NOT NULL LIMIT 1`
	if err := r.pool.QueryRow(ctx, query, userId, rekordboxID).Scan(&hash); err != nil {
		return "", err
	}
	return hash, nil
}

func (r *XMLStagingRepo) RecordPlaylistTrack(ctx context.Context, playlistID, userID uuid.UUID, rekordboxID int) error {
	query := `INSERT INTO staging_playlist_tracks (playlist_id, user_id, rekordbox_id)
		VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`
	_, err := r.pool.Exec(ctx, query, playlistID, userID, rekordboxID)
	return err
}

func (r *XMLStagingRepo) UnlinkedSyncedTracks(ctx context.Context, userID uuid.UUID) ([]domain.XMLStagingEntry, error) {
	query := `SELECT rekordbox_id, track_hash FROM xml_staging WHERE uploaded_by = $1 AND track_hash IS NOT NULL AND track_hash NOT IN (
		SELECT pt.track_hash FROM playlist_tracks pt JOIN playlists p ON p.playlist_id = pt.playlist_id WHERE p.user_id = $1
	)`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []domain.XMLStagingEntry
	for rows.Next() {
		var e domain.XMLStagingEntry
		if err := rows.Scan(&e.RekordboxID, &e.TrackHash); err != nil {
			continue
		}
		entries = append(entries, e)
	}
	return entries, nil
}

func (r *XMLStagingRepo) PlaylistsForRekordboxID(ctx context.Context, userID uuid.UUID, rekordboxID int) ([]uuid.UUID, error) {
	query := `SELECT playlist_id FROM staging_playlist_tracks WHERE user_id = $1 AND rekordbox_id = $2`
	rows, err := r.pool.Query(ctx, query, userID, rekordboxID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			continue
		}
		ids = append(ids, id)
	}
	return ids, nil
}

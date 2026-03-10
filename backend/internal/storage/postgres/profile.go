package postgres

import (
	"context"
	"record-pool/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProfileRepo struct {
	pool *pgxpool.Pool
}

func NewProfileRepo(pool *pgxpool.Pool) *ProfileRepo {
	return &ProfileRepo{pool: pool}
}

func (r *ProfileRepo) GetProfile(ctx context.Context, userID uuid.UUID) (*domain.ProfileData, error) {
	profile := &domain.ProfileData{UserID: userID}

	// User email:
	query := `SELECT email FROM users WHERE user_id = $1`
	if err := r.pool.QueryRow(ctx, query, userID).Scan(&profile.Email); err != nil {
		return nil, err
	}

	// Tracks uploaded by user
	query = `SELECT hash, file_format, title, artist, created_at FROM tracks
		WHERE hash IN (
			SELECT DISTINCT track_hash FROM track_metadata WHERE uploaded_by = $1
		) ORDER BY created_at DESC`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var t domain.Track
		if err := rows.Scan(&t.Hash, &t.Format, &t.Title, &t.Artist, &t.CreatedAt); err != nil {
			continue
		}
		profile.Tracks = append(profile.Tracks, t)
	}

	// Playlists owned by user
	query = `SELECT playlist_id, name, created_at FROM playlists WHERE user_id = $1`
	playlistRows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer playlistRows.Close()

	for playlistRows.Next() {
		var p domain.Playlist
		if err := playlistRows.Scan(&p.PlaylistID, &p.Name, &p.CreatedAt); err != nil {
			continue
		}
		query = `SELECT t.hash, t.file_format, t.title, t.artist, t.created_at
			FROM tracks t
			JOIN playlist_tracks pt ON pt.track_hash = t.hash
			WHERE pt.playlist_id = $1 ORDER BY pt.added_at ASC`
		trackRows, err := r.pool.Query(ctx, query, p.PlaylistID)
		if err == nil {
			return nil, err
		}
		defer trackRows.Close()

		for trackRows.Next() {
			var t domain.Track
			if err := trackRows.Scan(&t.Hash, &t.Format, &t.Title, &t.Artist, &t.CreatedAt); err != nil {
				continue
			}
			p.Tracks = append(p.Tracks, t)
		}
		profile.Playlists = append(profile.Playlists, p)
	}

	// Users own metadata versions
	query = `SELECT track_hash, uploaded_by, bpm, tonality, duration_seconds, album, comments, remixer,
		 label, mix, genre, year, composer, sample_rate, date_added, play_count, rating, bitrate,
		 cue_points, beatgrid, created_at
		 FROM track_metadata WHERE uploaded_by = $1 ORDER BY created_at DESC`
	metaRows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer metaRows.Close()

	for metaRows.Next() {
		meta, err := scanMetadata(metaRows)
		if err != nil {
			continue
		}
		profile.Metadata = append(profile.Metadata, *meta)
	}

	return profile, nil
}

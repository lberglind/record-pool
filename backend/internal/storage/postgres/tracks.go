package postgres

import (
	"context"
	"record-pool/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TrackRepo struct {
	pool *pgxpool.Pool
}

func NewTrackRepo(pool *pgxpool.Pool) *TrackRepo {
	return &TrackRepo{pool: pool}
}

func (r *TrackRepo) ListAllTracks(ctx context.Context) ([]domain.Track, error) {
	query := "SELECT file_hash, file_format, title, artist, COALESCE(duration_seconds, 0), created_at FROM tracks"

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tracks := []domain.Track{}
	for rows.Next() {
		var t domain.Track
		// err := rows.Scan(&t.Hash, &t.Format, &t.Title, &t.Artist, &t.Size, &t.Duration, &t.TimeStamp)
		err := rows.Scan(
			&t.Hash,
			&t.Format,
			&t.Title,
			&t.Artist,
			&t.Duration,
			&t.CreatedAt)
		if err != nil {
			continue
		}
		tracks = append(tracks, t)
	}
	return tracks, nil
}

func (r *TrackRepo) GetNameAndFormat(ctx context.Context, hash string) (string, string, error) {
	var title, format string
	query := "SELECT title, file_format FROM tracks WHERE file_hash = $1"

	err := r.pool.QueryRow(ctx, query, hash).Scan(&title, &format)
	return title, format, err

}

package postgres

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"record-pool/internal/domain"
	"strings"

	"github.com/dhowden/tag"
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

func (r *TrackRepo) AddTrack(ctx context.Context, file multipart.File, size int64) (string, error) {
	// 1. Hash the file
	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}
	fileHash := hex.EncodeToString(hash.Sum(nil))

	// 2. Reset file pointer and get Tags
	_, err := file.Seek(0, 0)
	if err != nil {
		return "", fmt.Errorf("Failed to reset file pointer")
	}

	m, err := tag.ReadFrom(file)
	if err != nil {
		return "", fmt.Errorf("Failed to read tags from file")
	}
	title := m.Title()
	artist := m.Artist()
	format := strings.ToLower(string(m.FileType()))

	// 3. Reset file pointer and get duration
	_, err = file.Seek(0, 0)
	if err != nil {
		return "", fmt.Errorf("Failed to reset file pointer")
	}

	// 4. Insert into database
	minioPath := fmt.Sprintf("tracks/%s.%s", fileHash, format)
	query := `INSERT INTO tracks 
	(file_hash, file_format, file_path, title, artist, size)
	VALUES ($1, $2, $3, $4, $5, $6) RETURNING track_id`

	var trackID string
	err = r.pool.QueryRow(ctx, query, fileHash, format, minioPath, title, artist, size).Scan(&trackID)
	if err != nil {
		log.Printf("Error inserting track in tracks: %s\n", err)
	} else {
		fmt.Printf("Track: %s inserted.\n", title)
	}
	return fileHash, nil
}

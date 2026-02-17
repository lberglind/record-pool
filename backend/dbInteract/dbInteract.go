package db

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"strings"
	"time"

	"github.com/dhowden/tag"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

type TrackResponse struct {
	Hash      string    `json:"hash"`
	Format    string    `json:"format"`
	Title     string    `json:"title"`
	Artist    string    `json:"artist"`
	Duration  float64   `json:"duration"`
	TimeStamp time.Time `json:"timeStamp"`
	// Size      int64  `json:"size"`
}

func AddTrack(ctx context.Context, pool *pgxpool.Pool, file multipart.File, size int64) (string, error) {
	// 1. Hash the file
	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}
	fileHash := hex.EncodeToString(hash.Sum(nil))

	// 2. Reset file pointer and get Tags
	_, err := file.Seek(0, 0)
	if err != nil {
		log.Printf("Error reseting file pointer: %s\n", err)
	}

	m, err := tag.ReadFrom(file)
	if err != nil {
		log.Printf("Could not read tags from file: %s\n", err)
	}
	title := m.Title()
	artist := m.Artist()
	format := strings.ToLower(string(m.FileType()))

	// 3. Reset file pointer and get duration
	_, err = file.Seek(0, 0)
	if err != nil {
		log.Printf("Error reseting file pointer: %s\n", err)
	}

	// 4. Insert into database
	minioPath := fmt.Sprintf("tracks/%s.%s", fileHash, format)
	query := `INSERT INTO tracks 
	(file_hash, file_format, file_path, title, artist, size)
	VALUES ($1, $2, $3, $4, $5, $6) RETURNING track_id`

	var trackID string
	err = pool.QueryRow(ctx, query, fileHash, format, minioPath, title, artist, size).Scan(&trackID)
	if err != nil {
		log.Printf("Error inserting track in tracks: %s\n", err)
	} else {
		fmt.Printf("Track: %s inserted.\n", title)
	}
	return fileHash, nil
}

func CreateUser(ctx context.Context, pool *pgxpool.Pool, email, name string) {
	var newID string

	query := "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING user_id"

	err := pool.QueryRow(ctx, query, email, name).Scan(&newID)
	if err != nil {
		fmt.Printf("Couldn't create user: %v", err)
		return
	}

	fmt.Printf("User created with ID: %s\n", newID)
}

func Connect(ctx context.Context) *pgxpool.Pool {
	err := godotenv.Load("../.env") // Only used when not running in Docker
	if err != nil {
		fmt.Println("Couldn't find file .env, uses system variables")
	}
	pool, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Printf("Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	err = pool.Ping(ctx)
	if err != nil {
		log.Printf("Databse unreachable: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("Successfully connected to database!")
	return pool
}

func GetFileName(ctx context.Context, pool *pgxpool.Pool, hash string) (string, string, error) {
	var title, format string
	query := "SELECT title, file_format FROM tracks WHERE file_hash = $1"

	err := pool.QueryRow(ctx, query, hash).Scan(&title, &format)
	return title, format, err
}

func GetAllTracks(ctx context.Context, pool *pgxpool.Pool) ([]TrackResponse, error) {
	query := "SELECT file_hash, file_format, title, artist, COALESCE(duration_seconds, 0), created_at FROM tracks"

	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tracks := []TrackResponse{}
	for rows.Next() {
		var t TrackResponse
		// err := rows.Scan(&t.Hash, &t.Format, &t.Title, &t.Artist, &t.Size, &t.Duration, &t.TimeStamp)
		err := rows.Scan(
			&t.Hash,
			&t.Format,
			&t.Title,
			&t.Artist,
			&t.Duration,
			&t.TimeStamp)
		if err != nil {
			continue
		}
		tracks = append(tracks, t)
	}
	return tracks, nil
}

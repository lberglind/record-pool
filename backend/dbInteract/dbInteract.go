package db

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"github.com/dhowden/tag"
	"github.com/hcl/audioduration"
	"github.com/jackc/pgx/v5"
)

func AddTrack(ctx context.Context, conn *pgx.Conn, filepath string) (string, error) {
	file, err := os.Open(filepath)
	if err != nil {
		log.Printf("Could not open file at %s: %s\n", filepath, err)
	}
	defer func() {
		_ = file.Close()
	}()

	// 1. Hash the file
	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}
	fileHash := hex.EncodeToString(hash.Sum(nil))

	// 2. Reset file pointer and get Tags
	_, err = file.Seek(0, 0)
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
	duration, err := audioduration.Mp3(file)
	if err != nil {
		log.Printf("Error getting audio duration: %s\n", err)
	}

	// 4. Insert into database
	minioPath := fmt.Sprintf("tracks/%s.%s", fileHash, format)
	query := `INSERT INTO tracks 
	(file_hash, file_format, file_path, title, artist, duration_seconds)
	VALUES ($1, $2, $3, $4, $5, $6) RETURNING track_id`

	var trackID string
	err = conn.QueryRow(ctx, query, fileHash, format, minioPath, title, artist, duration).Scan(&trackID)
	if err != nil {
		log.Printf("Error inserting track in tracks: %s\n", err)
	} else {
		fmt.Printf("Track: %s inserted.\n", title)
	}
	return fileHash, nil
}

func CreateUser(ctx context.Context, conn *pgx.Conn, email, name string) {
	var newID string

	query := "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING user_id"

	err := conn.QueryRow(ctx, query, email, name).Scan(&newID)
	if err != nil {
		fmt.Printf("Couldn't create user: %v", err)
		return
	}

	fmt.Printf("User created with ID: %s\n", newID)
}

func Init() *pgx.Conn {
	//err := godotenv.Load() // Only used when not running in Docker
	//if err != nil {
	//	fmt.Println("Couldn't find file .env, uses system variables")
	//}
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	} else {
		fmt.Println("Successfully connected to database!")
	}

	return conn
}

func getTitle(ctx context.Context, conn *pgx.Conn, hash string) (string, error) {
	var title string
	query := "SELECT TITLE FROM TRACKS WHERE file_hash = $1"

	err := conn.QueryRow(ctx, query, hash).Scan(&title)
	return title, err
}

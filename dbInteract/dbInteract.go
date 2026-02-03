package db

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"strings"

	"record-pool/utils"

	"github.com/dhowden/tag"
	"github.com/hcl/audioduration"
	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

func AddTrack(ctx context.Context, conn *pgx.Conn, filepath string) (string, error) {
	file, err := os.Open(filepath)
	checkErr(err)
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
	checkErr(err)

	m, err := tag.ReadFrom(file)
	checkErr(err)
	title := m.Title()
	artist := m.Artist()
	format := strings.ToLower(string(m.FileType()))

	// 3. Reset file pointer and get duration
	_, err = file.Seek(0, 0)
	checkErr(err)
	duration, err := audioduration.Mp3(file)
	checkErr(err)

	// 4. Insert into database
	minioPath := fmt.Sprintf("tracks/%s.%s", fileHash, format)
	query := `INSERT INTO tracks 
	(file_hash, file_format, file_path, title, artist, duration_seconds)
	VALUES ($1, $2, $3, $4, $5, $6) RETURNING track_id`

	var trackID string
	err = conn.QueryRow(ctx, query, fileHash, format, minioPath, title, artist, duration).Scan(&trackID)
	utils.CheckErr(err)
	fmt.Printf("Track: %s inserted.\n", title)
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

func checkErr(e error) {
	if e != nil {
		panic(e)
	}
}

func Init() *pgx.Conn {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Couldn't find file .env, uses system variables")
	}
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}

	return conn
}

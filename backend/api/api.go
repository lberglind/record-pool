package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	db "record-pool/dbInteract"
	storage "record-pool/minioInteract"

	"github.com/jackc/pgx/v5"
	"github.com/minio/minio-go/v7"
)

type Server struct {
	DB          *pgx.Conn
	MinioClient *minio.Client
}

func Upload(ctx context.Context, conn *pgx.Conn, minioClient *minio.Client, filePath string) {
	hash, err := db.AddTrack(ctx, conn, filePath)
	if err != nil {
		log.Printf("Could not insert track in database: %s\n", err)
	}
	storage.UploadFile(ctx, minioClient, hash, filePath)
}

func (s *Server) ListFileHandler(w http.ResponseWriter, r *http.Request) {
	// Allow React to see this data
	//	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
	//	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

	files, err := storage.FetchAllFiles(r.Context(), s.MinioClient)
	if err != nil {
		http.Error(w, "Failed to fetch files from storage", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(files)
	if err != nil {
		http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
	}
}

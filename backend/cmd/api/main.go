package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"record-pool/auth"
	handler "record-pool/handler"
	core "record-pool/internal"

	storage "record-pool/internal/storage"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("../.env") // Only used when not running in Docker
	if err != nil {
		fmt.Println("Couldn't find file .env, uses system variables")
	}

	// Initialize dependencies
	ctx := context.Background()
	pool := storage.Connect(ctx)
	defer pool.Close()

	minioClient := storage.Init()

	// Create shared container
	container := &core.Container{
		DB:    pool,
		Minio: minioClient,
	}

	auth.Init()

	// Map URLs to functions
	http.HandleFunc("/tracks", enableCORS(handler.ListAllFilesHandler(container)))
	http.HandleFunc("/download", enableCORS(handler.DownloadFileHandler(container)))
	http.HandleFunc("/upload", enableCORS(handler.UploadFileHandler(container)))
	http.HandleFunc("/auth/slack", enableCORS(auth.SlackLogInHandler))
	http.HandleFunc("/auth/slack/callback", enableCORS(auth.SlackCallbackHandler(container)))
	http.HandleFunc("/me", enableCORS(auth.MeHandler(container)))

	// Execution. Keep processes alive
	fmt.Println("Backend is live on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("FRONTEND_URL"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

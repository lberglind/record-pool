package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"record-pool/api"

	db "record-pool/dbInteract"
	storage "record-pool/minioInteract"
)

func main() {
	ctx := context.Background()
	conn := db.Init()
	defer func() {
		_ = conn.Close(ctx)
	}()

	minioClient := storage.Init()
	srv := &api.Server{
		DB:          conn,
		MinioClient: minioClient,
	}

	// Map URLs to functions
	http.HandleFunc("/files", enableCORS(srv.ListFileHandler))

	// Execution. Keep processes alive
	fmt.Println("Backend is live on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}

	// requestCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	// defer cancel()

	// Test vars
	// filePath := "/Users/ludwigberglind/Music/Platoon/Skrillex - Rumble.mp3"
	// End Test vars

	// db.CreateUser(queryCtx, conn, "erik@test.se", "erik")
	// hash, err := db.AddTrack(queryCtx, conn, filePath)
	// utils.CheckErr(err)
	// minioClient := storage.Init()
	// objectName := hash
	// minioInteract.UploadFile(ctx, minioClient, objectName, filePath)

	// api.Upload(requestCtx, conn, minioClient, filePath)
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

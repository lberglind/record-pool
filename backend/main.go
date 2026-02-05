package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"record-pool/handler"

	db "record-pool/dbInteract"
	storage "record-pool/minioInteract"
)

func main() {
	ctx := context.Background()
	pool := db.Connect(ctx)
	defer pool.Close()

	minioClient := storage.Init()
	srv := &handler.Server{
		DB:          pool,
		MinioClient: minioClient,
	}

	// Map URLs to functions
	http.HandleFunc("/files", enableCORS(srv.ListAllFilesHandler))

	// Execution. Keep processes alive
	fmt.Println("Backend is live on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
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

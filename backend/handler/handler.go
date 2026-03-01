package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"path/filepath"

	db "record-pool/dbInteract"
	core "record-pool/internal"
	storage "record-pool/minioInteract"
)

//func Upload(ctx context.Context, pool *pgxpool.Pool, minioClient *minio.Client, filePath string) {
//	hash, err := db.AddTrack(ctx, pool, filePath)
//	if err != nil {
//		log.Printf("Could not insert track in database: %s\n", err)
//	} else {
//		storage.UploadFile(ctx, minioClient, hash, filePath)
//	}
//}

//func (s *Server) ListFileHandler(w http.ResponseWriter, r *http.Request) {
//	files, err := storage.FetchAllFilenames(r.Context(), s.MinioClient)
//	if err != nil {
//		http.Error(w, "Failed to fetch files from storage", http.StatusInternalServerError)
//		return
//	}
//	w.Header().Set("Content-Type", "application/json")
//	err = json.NewEncoder(w).Encode(files)
//	if err != nil {
//		http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
//	}
//}

func ListAllFilesHandler(c *core.Container) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tracks, err := db.GetAllTracks(r.Context(), c.DB)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(tracks)
		if err != nil {
			http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
		}
	}
}

func DownloadFileHandler(c *core.Container) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get filename from query string
		hash := r.URL.Query().Get("file")
		if hash == "" {
			http.Error(w, "File name required", http.StatusBadRequest)
			return
		}

		// Fetch the file from MinIO
		object, err := storage.GetFile(r.Context(), c.Minio, hash)
		if err != nil {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}
		defer func() {
			_ = object.Close()
		}()

		// Get object info needed for the headers
		stat, err := object.Stat()
		if err != nil {
			http.Error(w, "File storage error", http.StatusInternalServerError)
			return
		}
		name, format, err := db.GetFileName(r.Context(), c.DB, hash)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		contentType := mime.TypeByExtension(filepath.Ext(hash))
		if contentType == "" {
			contentType = "application/octet-stream"
		}

		// Set headers
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s.%s\"", name, format))
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Length", fmt.Sprintf("%d", stat.Size))

		// Stream data directly to the response
		_, err = io.Copy(w, object)
		if err != nil {
			log.Printf("Error streaming file: %v\n", err)
			return
		}
	}
}

func UploadFileHandler(c *core.Container) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const maxMemory = 10 << 20
		if err := r.ParseMultipartForm(maxMemory); err != nil {
			http.Error(w, "File too large or bad request", http.StatusBadRequest)
			return
		}

		file, header, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Invalid file", http.StatusBadRequest)
			return
		}
		fmt.Println(header)
		defer file.Close()

		hash, err := db.AddTrack(r.Context(), c.DB, file, header.Size)
		if err != nil {
			http.Error(w, "Could not add track", http.StatusInternalServerError)
			return
		}
		file.Seek(0, 0)
		storage.Upload(r.Context(), c.Minio, hash, file, header.Size)
		if err != nil {
			http.Error(w, "Could not upload file to minio", http.StatusInternalServerError)
		}
		w.WriteHeader(http.StatusCreated)
		fmt.Fprintf(w, "Upload Successful: %s", hash)
	}
}

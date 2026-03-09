package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"path/filepath"
	"record-pool/internal/domain"
)

type TrackHandler struct {
	Repo  domain.TrackRepository
	Store domain.ObjectStore
}

func (h *TrackHandler) ListAllTracks() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tracks, err := h.Repo.ListAllTracks(r.Context())
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

func (h *TrackHandler) Download() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get filename from query string
		hash := r.URL.Query().Get("file")
		if hash == "" {
			http.Error(w, "File name required", http.StatusBadRequest)
			return
		}

		// Fetch the file from MinIO
		object, size, err := h.Store.GetTrack(r.Context(), hash)
		if err != nil {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}
		defer func() {
			_ = object.Close()
		}()

		name, format, err := h.Repo.GetNameAndFormat(r.Context(), hash)
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
		w.Header().Set("Content-Length", fmt.Sprintf("%d", size))

		// Stream data directly to the response
		_, err = io.Copy(w, object)
		if err != nil {
			log.Printf("Error streaming file: %v\n", err)
			return
		}
	}
}

func (h *TrackHandler) Upload() http.HandlerFunc {
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
		defer file.Close()

		hash, err := h.Repo.AddTrack(r.Context(), file, header.Size)
		if err != nil {
			http.Error(w, "Could not add track", http.StatusInternalServerError)
			return
		}
		file.Seek(0, 0)
		err = h.Store.Upload(r.Context(), hash, file, header.Size)
		if err != nil {
			http.Error(w, "Could not upload file to minio", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
		fmt.Fprintf(w, "Upload Successful: %s", hash)
	}
}

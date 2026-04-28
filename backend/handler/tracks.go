package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"record-pool/internal/domain"
	"record-pool/internal/service"
	"record-pool/internal/track"
	"record-pool/middleware"
	"record-pool/parser"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type TrackHandler struct {
	Repo         domain.TrackRepository
	MetadataRepo domain.TrackMetadataRepository
	StagingRepo  domain.XMLStagingRepository
	XMLSync      *service.XMLSyncService
	Store        domain.ObjectStore
}

// ListAllTracks
// @Summary List all tracks
// @Description Get a full list of all tracks in the database
// @Tags Tracks
// @Produce json
// @Success 200 {array} domain.Track
// @Router /tracks [get]
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
			return
		}
	}
}

// ListTrackPage
// @Summary Paginated tracks
// @Description Get tracks using cursor-based pagination
// @Tags Tracks
// @Produce json
// @Param date query string false "RFC3339 date cursor"
// @Param hash query string false "Tie-breaker hash cursor"
// @Param limit query int false "Limit (default 50, max 200)"
// @Success 200 {array} domain.Track
// @Router /tracks/page [get]
func (h *TrackHandler) ListTrackPage() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		date := r.URL.Query().Get("date")
		hash := r.URL.Query().Get("hash")
		limitStr := r.URL.Query().Get("limit")
		limit := 50
		if limitStr != "" {
			if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 {
				limit = min(parsed, 200)
			}
		}
		var cursor *time.Time
		if date != "" {
			t, err := time.Parse(time.RFC3339, date)
			if err != nil {
				http.Error(w, "Invalid date format, expected RFC3339", http.StatusBadRequest)
				return
			}
			cursor = &t
		}
		cursorHash := ""
		if cursor != nil {
			cursorHash = hash
		}
		tracks, err := h.Repo.ListTrackPage(r.Context(), cursor, cursorHash, limit)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(tracks)
		if err != nil {
			http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
			return
		}
	}
}

// Download
// @Summary Download a track
// @Description Stream a music file from storage using its hash
// @Tags Tracks
// @Produce audio/mpeg
// @Param hash path string true "The track hash"
// @Success 200 {file} binary
// @Failure 404 {string} string "File not found"
// @Router /tracks/{hash}/file [get]
func (h *TrackHandler) Download() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get filename from query string
		hash := r.PathValue("hash")
		if hash == "" {
			http.Error(w, "Track hash required", http.StatusBadRequest)
			return
		}

		// Fetch the file from MinIO
		object, size, err := h.Store.GetTrack(r.Context(), hash)
		if err != nil {
			http.Error(w, "Track not found", http.StatusNotFound)
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
		filename := fmt.Sprintf("%s.%s", name, format)
		encodedName := url.PathEscape(filename)
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", encodedName))
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Length", fmt.Sprintf("%d", size))

		// Stream data directly to the response
		_, err = io.Copy(w, object)
		if err != nil {
			log.Printf("Error streaming track file: %v\n", err)
			return
		}
	}
}

// Upload
// @Summary Upload a track
// @Description Upload a single music file and extract metadata
// @Tags Tracks
// @Accept multipart/form-data
// @Produce plain
// @Param file formData file true "The music file to upload"
// @Success 201 {string} string "Upload Successful: <hash>"
// @Router /tracks [post]
func (h *TrackHandler) Upload() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
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

		// Option 2
		trackData, err := track.ExecExtractMetadata(r.Context(), file, header)
		if err != nil {
			http.Error(w, "Could not read track exec metadata: "+err.Error(), http.StatusBadRequest)
			return
		}
		err = h.Repo.ExecAddTrack(r.Context(), trackData)
		if err != nil {
			http.Error(w, "Could not add track: "+err.Error(), http.StatusInternalServerError)
			return
		}

		_, err = file.Seek(0, 0)
		if err != nil {
			http.Error(w, "Failed to process file", http.StatusInternalServerError)
			return
		}
		err = h.Store.Upload(r.Context(), trackData.Hash, file, header.Size)
		if err != nil {
			http.Error(w, "Could not upload file to minio", http.StatusInternalServerError)
			return
		}
		if trackData.Cover != nil && trackData.MimeType != "" {
			err = h.Store.UploadCover(r.Context(), trackData.Hash, trackData.MimeType, trackData.Cover)
			if err != nil {
				http.Error(w, "Could not upload album cover to minio", http.StatusInternalServerError)
				return
			}
		}

		go h.XMLSync.TrySync(context.Background(), userID, nil)

		w.WriteHeader(http.StatusCreated)
		fmt.Fprintf(w, "Upload Successful: %s", trackData.Hash)
	}
}

type BatchUploadResponse struct {
	Name  string `json:"name"`
	Hash  string `json:"hash,omitempty"`
	Error string `json:"error,omitempty"`
}

// BatchUpload
// @Summary Batch upload tracks
// @Description Upload multiple music files at once. Returns a list of results for each file.
// @Tags Tracks
// @Accept multipart/form-data
// @Produce json
// @Param files formData file true "Multiple music files"
// @Success 207 {array} BatchUploadResponse "Multi-Status: Returns success/error for each file"
// @Router /tracks/batch [post]
func (h *TrackHandler) BatchUpload() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		mediatype, params, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
		if err != nil || mediatype != "multipart/form-data" {
			http.Error(w, "Expected multipart/form-data", http.StatusBadRequest)
			return
		}
		type result struct {
			Name  string `json:"name"`
			Hash  string `json:"hash,omitempty"`
			Error string `json:"error,omitempty"`
		}
		var results []result

		mr := multipart.NewReader(r.Body, params["boundary"])
		for {
			part, err := mr.NextPart()
			if err == io.EOF {
				break
			}
			if err != nil {
				http.Error(w, "Failed to read multipart stream", http.StatusBadRequest)
				return
			}

			if part.FormName() != "files" {
				part.Close()
				continue
			}

			filename := part.FileName()

			tmp, err := os.CreateTemp("", "upload-*")
			if err != nil {
				part.Close()
				results = append(results, result{Name: filename, Error: "Server Error creating temp file"})
				continue
			}

			size, err := io.Copy(tmp, part)
			part.Close()
			if err != nil {
				tmp.Close()
				os.Remove(tmp.Name())
				results = append(results, result{Name: filename, Error: "failed to recieve file"})
				continue
			}

			if _, err := tmp.Seek(0, 0); err != nil {
				tmp.Close()
				os.Remove(tmp.Name())
				results = append(results, result{Name: filename, Error: "seek failed"})
				continue
			}

			trackData, err := track.ExtractMetadata(tmp)
			if err != nil {
				tmp.Close()
				os.Remove(tmp.Name())
				results = append(results, result{Name: filename, Error: "could not read metadata"})
				continue
			}

			if err := h.Repo.AddTrack(r.Context(), trackData, size); err != nil {
				tmp.Close()
				os.Remove(tmp.Name())
				results = append(results, result{Name: filename, Error: err.Error()})
				continue
			}
			if _, err := tmp.Seek(0, 0); err != nil {
				tmp.Close()
				os.Remove(tmp.Name())
				results = append(results, result{Name: filename, Error: "seek failed before upload"})
				continue
			}

			if err := h.Store.Upload(r.Context(), trackData.Hash, tmp, size); err != nil {
				tmp.Close()
				os.Remove(tmp.Name())
				results = append(results, result{Name: filename, Error: "storage failed"})
				continue
			}
			if trackData.Cover != nil && trackData.MimeType != "" {
				err = h.Store.UploadCover(r.Context(), trackData.Hash, trackData.MimeType, trackData.Cover)
				if err != nil {
					http.Error(w, "Could not upload album cover to minio", http.StatusInternalServerError)
					return
				}
			}
			tmp.Close()
			os.Remove(tmp.Name())
			results = append(results, result{Name: filename, Hash: trackData.Hash})
		}

		go h.XMLSync.TrySync(context.Background(), userID, nil)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMultiStatus)
		json.NewEncoder(w).Encode(results)
	}
}

// UploadXML
// @Summary Import Rekordbox XML
// @Description Upload a Rekordbox collection XML to sync metadata and playlists
// @Tags Tracks
// @Accept multipart/form-data
// @Produce plain
// @Param file formData file true "Rekordbox XML file"
// @Success 201 {string} string "Imported X tracks"
// @Router /xml [post]
func (h *TrackHandler) UploadXML() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Parse the multipart form
		const maxMemory = 32 << 20 // 32 MB
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

		// Read entire file into memory to parse and store it
		raw, err := io.ReadAll(file)
		if err != nil {
			http.Error(w, "Failed to read file", http.StatusInternalServerError)
			return
		}

		// Parse the XML
		rb, err := parser.Parse(bytes.NewReader(raw))
		if err != nil {
			http.Error(w, "Invalid Rekordbox XML: "+err.Error(), http.StatusBadRequest)
			return
		}

		// Map parsed tracks to staged entries

		entries := make([]domain.XMLStagingEntry, 0, len(rb.Collection.Tracks))
		for _, t := range rb.Collection.Tracks {
			dateAdded, err := parseDate(t.DateAdded)
			if err != nil {
				log.Printf("xml upload: could not parse date %q for track %d, skipping date\n", t.DateAdded, t.Id)
			}

			cuePoints := make([]domain.CuePoint, len(t.CuePoints))
			for i, cp := range t.CuePoints {
				cuePoints[i] = domain.CuePoint{
					Name:  cp.Name,
					Type:  cp.Type,
					Start: cp.Start,
					Num:   cp.Num,
					Red:   cp.Red,
					Green: cp.Green,
					Blue:  cp.Blue,
				}
			}
			beatgrid := make([]domain.Tempo, len(t.Tempos))
			for i, tempo := range t.Tempos {
				beatgrid[i] = domain.Tempo{
					Inizio:  tempo.Inizio,
					BPM:     tempo.BPM,
					Metro:   tempo.Metro,
					Battito: tempo.Battito,
				}
			}
			entries = append(entries, domain.XMLStagingEntry{
				UploadedBy:  userID,
				RekordboxID: t.Id,
				Title:       t.Name,
				Artist:      t.Artist,
				Location:    t.Location,
				BPM:         t.BPM,
				Tonality:    t.Tonality,
				Duration:    t.Duration,
				Album:       t.Album,
				Comments:    t.Comments,
				Remixer:     t.Remixer,
				Label:       t.Label,
				Mix:         t.Mix,
				Genre:       t.Genre,
				Size:        t.Size,
				Year:        t.Year,
				Composer:    t.Composer,
				SampleRate:  t.SampleRate,
				DateAdded:   dateAdded,
				PlayCount:   t.Playcount,
				Rating:      t.Rating,
				Bitrate:     t.BitRate,
				CuePoints:   cuePoints,
				Beatgrid:    beatgrid,
			})
		}

		// Upsert all staging entries
		if err := h.StagingRepo.UpsertBatch(r.Context(), entries); err != nil {
			http.Error(w, "Failed to stage XML: "+err.Error(), http.StatusInternalServerError)
			return
		}
		if err := h.Store.UploadCollectionXML(r.Context(), userID, bytes.NewReader(raw), header.Size); err != nil {
			log.Printf("xml upload: failed to store raw XML for user %s: %v\n", userID, err)
		}

		// Kick off sync in the background
		go h.XMLSync.TrySync(context.Background(), userID, rb)
		w.WriteHeader(http.StatusCreated)
		fmt.Fprintf(w, "Imported %d tracks", len(entries))
	}
}

// parseDate parses Rekordbox's "2024-03-15" date format into a *time.Time.
// Returns nil (not an error) if the string is empty — many tracks have no date.
func parseDate(s string) (*time.Time, error) {
	if s == "" {
		return nil, nil
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

package handler

import (
	"encoding/json"
	"net/http"
	"record-pool/internal/domain"
)

type TrackHandler struct {
	Repo domain.TrackRepository
}

func (h TrackHandler) ListAllTracks() http.HandlerFunc {
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

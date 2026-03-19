package handler

import (
	"encoding/json"
	"net/http"
	"record-pool/internal/domain"
	"record-pool/middleware"

	"github.com/google/uuid"
	"github.com/gorilla/schema"
)

type SearchHandler struct {
	Repo domain.SearchRepository
}

// TrackSearch
// @Summary Advanced Track Search
// @Description Search tracks with fuzzy matching, metadata filtering, and range queries.
// @Tags Search
// @Accept json
// @Produce json
// @Param params query domain.SearchParams true "Search Filters"
// @Success 200 {array} domain.Track
// @Failure 400 {string} string "Invalid query parameters"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Internal server error"
// @Router /search [get]
func (h *SearchHandler) TrackSearch() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		var req domain.SearchParams
		err := schema.NewDecoder().Decode(&req, r.URL.Query())
		if err != nil {
			http.Error(w, "Invalid query parameters", http.StatusBadRequest)
			return
		}

		result, err := h.Repo.SearchTracks(r.Context(), req)
		if err != nil {
			http.Error(w, "Failed to process search query", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(result)
		if err != nil {
			http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
			return
		}
	}
}

package handler

import (
	"encoding/json"
	"net/http"
	"record-pool/internal/domain"
	"record-pool/middleware"

	"github.com/google/uuid"
)

type LikeHandler struct {
	Repo domain.LikeRepository
}

// LikeTrack
// @Summary Likes a track
// @Description Adds a track to a user's liked tracks
// @Tags Likes
// @Param hash path 	string true "Track Hash"
// @Produce plain
// @Success 201 {object} nil "Created"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Database error"
// @Router /likes/{hash} [post]
func (h *LikeHandler) LikeTrack() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		hash := r.PathValue("hash")
		err := h.Repo.LikeTrack(r.Context(), userID, hash)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// DeleteTrackLike
// @Summary Removes a liked track
// @Description Removes a track from the user's liked tracks
// @Tags Likes
// @Param hash path 	string true "Track Hash"
// @Produce plain
// @Success 204 {object} nil "No Content"
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Database error"
// @Router /likes/{hash} [delete]
func (h *LikeHandler) DeleteTrackLike() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		hash := r.PathValue("hash")
		err := h.Repo.DeleteTrackLike(r.Context(), userID, hash)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

// GetTrackLikesForUser
// @Summary Gets a users liked tracks
// @Description Retrieves all tracks liked by the authenticated user session.
// @Tags Likes
// @Produce json
// @Success 200 array domain.Like
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Database error"
// @Router /likes [get]
func (h *LikeHandler) GetTrackLikesForUser() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		likes, err := h.Repo.GetTrackLikesForUser(r.Context(), userID)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(likes)
		if err != nil {
			http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
			return
		}
	}
}

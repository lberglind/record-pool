package handler

import (
	"encoding/json"
	"net/http"
	"record-pool/internal/domain"
	"record-pool/middleware"

	"github.com/google/uuid"
)

type PlaylistHandler struct {
	Repo domain.PlaylistRepository
}

// GetTree
// @Summary Get playlist tree
// @Description returns the nested folder structure of playlists
// @Tags Playlists
// @Produce json
// @Success 200 {array} domain.Playlist
// @Router /playlists [get]
func (h *PlaylistHandler) GetTree() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		playlists, err := h.Repo.GetTree(r.Context(), userID)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(playlists)
	}
}

// Get
// @Summary Get playlist
// @Description returns the contents of a playlist with a certain id
// @Tags Playlists
// @Produce json
// @Param id path string true "Playlist ID (UUID)"
// @Success 200 {object} domain.Playlist
// @Failure 404 {string} string "Playlist not found"
// @Router /playlists/{id} [get]
func (h *PlaylistHandler) Get() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		playlistID, err := uuid.Parse(r.PathValue("id"))
		if err != nil {
			http.Error(w, "Invalid playlist ID", http.StatusBadRequest)
			return
		}
		playlist, err := h.Repo.Get(r.Context(), userID, playlistID)
		if err != nil {
			http.Error(w, "Playlist not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(playlist)
	}
}

type CreatePlaylistRequest struct {
	Name     string     `json:"name"`
	ParentID *uuid.UUID `json:"parentID"`
	IsFolder bool       `json:"isFolder"`
}

// Create
// @Summary Create a playlist or folder
// @Description Create a new entry in the playlist tree
// @Tags Playlists
// @Accept json
// @Produce json
// @Param body body CreatePlaylistRequest true "Playlist creation data"
// @Success 201 {object} domain.Playlist
// @Router /playlists [post]
func (h *PlaylistHandler) Create() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var body struct {
			Name     string     `json:"name"`
			ParentID *uuid.UUID `json:"parentID"`
			IsFolder bool       `json:"isFolder"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		if body.Name == "" {
			http.Error(w, "name is required", http.StatusBadRequest)
			return
		}

		playlist, err := h.Repo.Create(r.Context(), userID, body.Name, body.ParentID, body.IsFolder, 0, false)
		if err != nil {
			http.Error(w, "Failed to create playlist", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(playlist)
	}
}

// Delete
// @Summary Delete a playlist
// @Description Removes a playlist or folder. Use with caution.
// @Tags Playlists
// @Param id path string true "Playlist ID"
// @Success 204 "No Content"
// @Router /playlists/{id} [delete]
func (h *PlaylistHandler) Delete() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		playlistID, err := uuid.Parse(r.PathValue("id"))
		if err != nil {
			http.Error(w, "Invalid playlist ID", http.StatusBadRequest)
			return
		}

		if err := h.Repo.Delete(r.Context(), userID, playlistID); err != nil {
			http.Error(w, "Failed to delete playlist", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

type AddTrackRequest struct {
	TrackHash string `json:"trackHash"`
}

// AddTrack
// @Summary Add track to playlist
// @Tags Playlists
// @Accept json
// @Param id path string true "Playlist ID"
// @Param body body AddTrackRequest true "Track Hash"
// @Success 204 "No Content"
// @Router /playlists/{id}/tracks [post]
func (h *PlaylistHandler) AddTrack() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		playlistID, err := uuid.Parse(r.PathValue("id"))
		if err != nil {
			http.Error(w, "Invalid playlist ID", http.StatusBadRequest)
			return
		}

		if _, err := h.Repo.Get(r.Context(), userID, playlistID); err != nil {
			http.Error(w, "Playlist not found", http.StatusNotFound)
			return
		}

		var body struct {
			TrackHash string `json:"trackHash"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.TrackHash == "" {
			http.Error(w, "trackHash is required", http.StatusBadRequest)
			return
		}

		if err := h.Repo.AddTrack(r.Context(), playlistID, body.TrackHash); err != nil {
			http.Error(w, "Failed to add track", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

// RemoveTrack
// @Summary Remove track from playlist
// @Tags Playlists
// @Param id path string true "Playlist ID"
// @Param hash path string true "Track Hash"
// @Success 204 "No Content"
// @Router /playlists/{id}/tracks/{hash} [delete]
func (h *PlaylistHandler) RemoveTrack() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		playlistID, err := uuid.Parse(r.PathValue("id"))
		if err != nil {
			http.Error(w, "Invalid playlist ID", http.StatusBadRequest)
			return
		}

		// Verify ownership
		if _, err := h.Repo.Get(r.Context(), userID, playlistID); err != nil {
			http.Error(w, "Playlist not found", http.StatusNotFound)
			return
		}

		trackHash := r.PathValue("hash")
		if trackHash == "" {
			http.Error(w, "track hash is required", http.StatusBadRequest)
			return
		}

		if err := h.Repo.RemoveTrack(r.Context(), playlistID, trackHash); err != nil {
			http.Error(w, "Failed to remove track", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

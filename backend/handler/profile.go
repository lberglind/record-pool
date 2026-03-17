package handler

import (
	"encoding/json"
	"net/http"
	"record-pool/internal/domain"
	"record-pool/middleware"

	"github.com/google/uuid"
)

type ProfileHandler struct {
	Repo domain.ProfileRepository
}

// GetProfile
// @Summary Get user profile
// @Tags Profile
// @Produce json
// @Success 200 {object} domain.ProfileData
// @Router /profile [get]
func (h *ProfileHandler) GetProfile() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDContextKey).(uuid.UUID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		profile, err := h.Repo.GetProfile(r.Context(), userID)
		if err != nil {
			http.Error(w, "Failed to load profile", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(profile)
	}
}

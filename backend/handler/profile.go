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

package handler

import (
	"encoding/json"
	"net/http"
	"record-pool/internal/domain"
)

type SessionHandler struct {
	Repo domain.SessionRepository
}

func (h *SessionHandler) Me() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			http.Error(w, "Not logged in", http.StatusUnauthorized)
			return
		}

		sessionID := cookie.Value

		email, err := h.Repo.EmailFromSession(r.Context(), sessionID)

		if err != nil {
			http.Error(w, "Invalid session", http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"email": email,
		})
	}
}

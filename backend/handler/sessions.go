package handler

import (
	"encoding/json"
	"net/http"
	"record-pool/internal/domain"
)

type SessionHandler struct {
	Repo domain.SessionRepository
}

// Me
// @Summary Get current session
// @Description Returns the email and userID of the logged-in user via session cookie
// @Tags Auth
// @Produce json
// @Success 200 {object} map[string]string "{"email": "...", "userID": "..."}"
// @Failure 401 {string} string "Not logged in"
// @Router /me [get]
func (h *SessionHandler) Me() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			http.Error(w, "Not logged in", http.StatusUnauthorized)
			return
		}

		sessionID := cookie.Value

		email, userID, err := h.Repo.UserFromSession(r.Context(), sessionID)

		if err != nil {
			http.Error(w, "Invalid session", http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"email":  email,
			"userID": userID.String(),
		})
	}
}

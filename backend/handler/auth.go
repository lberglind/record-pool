package handler

import (
	"net/http"
	"os"
	"record-pool/internal/domain"
	"record-pool/internal/service"
	"time"
)

type AuthHandler struct {
	Users    domain.UserRepository
	Sessions domain.SessionRepository
	Auth     service.SlackAuth
}

func (h *AuthHandler) SlackCallback() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		code := r.URL.Query().Get("code")
		if code == "" {
			http.Error(w, "No code in request", http.StatusBadRequest)
			return
		}
		authUser, err := h.Auth.UserFromCode(r.Context(), code)

		if err != nil {
			http.Error(w, "Auth failed: "+err.Error(), http.StatusInternalServerError)
			return
		}

		userID, err := h.Users.UpsertUser(r.Context(), authUser.Email, authUser.Name)
		if err != nil {
			http.Error(w, "Failed the database checks: "+err.Error(), http.StatusInternalServerError)
			return
		}

		sessionID, err := h.Sessions.CreateSession(r.Context(), userID)
		if err != nil {
			http.Error(w, "Session creation failed: "+err.Error(), http.StatusInternalServerError)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "session",
			Value:    sessionID,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteNoneMode, // allows sending cookie on redirect
			MaxAge:   int((24 * 7 * time.Hour).Seconds()),
		})
		http.Redirect(w, r, os.Getenv("FRONTEND_URL")+"/login/callback", http.StatusSeeOther)
		// http.Redirect(w, r, os.Getenv("FRONTEND_URL"), http.StatusSeeOther)
	}
}

func (h *AuthHandler) SlackLogIn() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		url := h.Auth.AuthCodeURL("random-state-string")
		http.Redirect(w, r, url, http.StatusTemporaryRedirect)
	}
}

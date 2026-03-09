package middleware

import (
	"context"
	"net/http"
	"record-pool/internal/domain"
)

type contextKey string

const EmailContextKey contextKey = "email"

func RequireAuth(repo domain.SessionRepository, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		email, err := repo.EmailFromSession(r.Context(), cookie.Value)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), EmailContextKey, email)
		next(w, r.WithContext(ctx))
	}
}

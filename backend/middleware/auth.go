package middleware

import (
	"context"
	"net/http"
	"record-pool/internal/domain"
)

type contextKey string

const EmailContextKey contextKey = "email"
const UserIDContextKey contextKey = "userID"

func RequireAuth(repo domain.SessionRepository, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		userID, email, _, err := repo.UserFromSession(r.Context(), cookie.Value)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), EmailContextKey, email)
		ctx = context.WithValue(ctx, UserIDContextKey, userID)
		next(w, r.WithContext(ctx))
	}
}

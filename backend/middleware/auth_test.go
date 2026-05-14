package middleware_test

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"record-pool/middleware"

	"github.com/google/uuid"
)

// mockSessionRepo satisfies domain.SessionRepository
type mockSessionRepo struct {
	userID  uuid.UUID
	email   string
	avatar  string
	userErr error
}

func (m *mockSessionRepo) UserFromSession(_ context.Context, _ string) (uuid.UUID, string, string, error) {
	return m.userID, m.email, m.avatar, m.userErr
}

func (m *mockSessionRepo) CreateSession(_ context.Context, _ string) (string, error) {
	return "", nil
}

func TestRequireAuth_NoCookie_Returns401(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler := middleware.RequireAuth(&mockSessionRepo{}, next)
	req := httptest.NewRequest(http.MethodGet, "/tracks", nil)
	w := httptest.NewRecorder()
	handler(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestRequireAuth_InvalidSession_Returns401(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	repo := &mockSessionRepo{userErr: errors.New("session not found")}
	handler := middleware.RequireAuth(repo, next)

	req := httptest.NewRequest(http.MethodGet, "/tracks", nil)
	req.AddCookie(&http.Cookie{Name: "session", Value: "bad-session"})
	w := httptest.NewRecorder()
	handler(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestRequireAuth_ValidSession_CallsNext(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify email was injected into context
		email, ok := r.Context().Value(middleware.EmailContextKey).(string)
		if !ok || email != "dj@example.com" {
			t.Errorf("expected email in context, got %q", email)
		}
		w.WriteHeader(http.StatusOK)
	})

	repo := &mockSessionRepo{email: "dj@example.com"}
	handler := middleware.RequireAuth(repo, next)

	req := httptest.NewRequest(http.MethodGet, "/tracks", nil)
	req.AddCookie(&http.Cookie{Name: "session", Value: "valid-session"})
	w := httptest.NewRecorder()
	handler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

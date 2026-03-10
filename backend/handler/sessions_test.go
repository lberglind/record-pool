package handler_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"record-pool/handler"
	"record-pool/internal/domain"

	"github.com/google/uuid"
)

var _ domain.SessionRepository = &mockSessionRepo{}

type mockSessionRepo struct {
	email         string
	userID        uuid.UUID
	userErr       error
	createSession string
	createErr     error
}

func (m *mockSessionRepo) UserFromSession(ctx context.Context, session string) (string, uuid.UUID, error) {
	return m.email, m.userID, m.userErr
}

func (m *mockSessionRepo) CreateSession(ctx context.Context, userID string) (string, error) {
	return m.createSession, m.createErr
}

func TestMe_NoCookie_Returns401(t *testing.T) {
	h := &handler.SessionHandler{Repo: &mockSessionRepo{}}

	req := httptest.NewRequest(http.MethodGet, "/me", nil) // no cookie
	w := httptest.NewRecorder()
	h.Me()(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestMe_InvalidSession_Returns401(t *testing.T) {
	h := &handler.SessionHandler{
		Repo: &mockSessionRepo{userErr: errors.New("session not found")},
	}

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.AddCookie(&http.Cookie{Name: "session", Value: "bad-session-id"})
	w := httptest.NewRecorder()
	h.Me()(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestMe_ValidSession_ReturnsEmail(t *testing.T) {
	h := &handler.SessionHandler{
		Repo: &mockSessionRepo{email: "dj@example.com"},
	}

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.AddCookie(&http.Cookie{Name: "session", Value: "valid-session-id"})
	w := httptest.NewRecorder()
	h.Me()(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var body map[string]string
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("could not decode body: %v", err)
	}
	if body["email"] != "dj@example.com" {
		t.Errorf("expected dj@example.com, got %s", body["email"])
	}
}

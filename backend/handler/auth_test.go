package handler_test

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"record-pool/handler"
	"record-pool/internal/domain"
	"record-pool/internal/service"
)

var _ domain.UserRepository = &mockUserRepo{}
var _ service.SlackAuth = &mockSlackAuth{}

type mockUserRepo struct {
	userID    string
	upsertErr error
}

func (m *mockUserRepo) UpsertUser(ctx context.Context, email, name, avatar string) (string, error) {
	return m.userID, m.upsertErr
}

type mockSlackAuth struct {
	authCodeURL     string
	authUser        *service.AuthUser
	userFromCodeErr error
}

func (m *mockSlackAuth) AuthCodeURL(state string) string {
	return m.authCodeURL
}

func (m *mockSlackAuth) UserFromCode(ctx context.Context, code string) (*service.AuthUser, error) {
	return m.authUser, m.userFromCodeErr
}

// --- SlackLogIn ---

func TestSlackLogIn_RedirectsToSlack(t *testing.T) {
	h := &handler.AuthHandler{
		Auth: &mockSlackAuth{authCodeURL: "https://slack.com/oauth/authorize?foo=bar"},
	}

	req := httptest.NewRequest(http.MethodGet, "/auth/slack", nil)
	w := httptest.NewRecorder()
	h.SlackLogIn()(w, req)

	if w.Code != http.StatusTemporaryRedirect {
		t.Errorf("expected 307, got %d", w.Code)
	}
	if loc := w.Header().Get("Location"); loc != "https://slack.com/oauth/authorize?foo=bar" {
		t.Errorf("unexpected redirect location: %s", loc)
	}
}

// --- SlackCallback ---

func TestSlackCallback_MissingCode_Returns400(t *testing.T) {
	h := &handler.AuthHandler{
		Auth:     &mockSlackAuth{},
		Users:    &mockUserRepo{},
		Sessions: &mockSessionRepo{},
	}

	req := httptest.NewRequest(http.MethodGet, "/auth/slack/callback", nil) // no ?code=
	w := httptest.NewRecorder()
	h.SlackCallback()(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestSlackCallback_AuthFails_Returns500(t *testing.T) {
	h := &handler.AuthHandler{
		Auth:     &mockSlackAuth{userFromCodeErr: errors.New("slack error")},
		Users:    &mockUserRepo{},
		Sessions: &mockSessionRepo{},
	}

	req := httptest.NewRequest(http.MethodGet, "/auth/slack/callback?code=abc", nil)
	w := httptest.NewRecorder()
	h.SlackCallback()(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected 500, got %d", w.Code)
	}
}

func TestSlackCallback_Success_SetsCookieAndRedirects(t *testing.T) {
	t.Setenv("FRONTEND_URL", "https://myapp.com")

	h := &handler.AuthHandler{
		Auth: &mockSlackAuth{
			authUser: &service.AuthUser{Email: "dj@example.com", Name: "DJ Test"},
		},
		Users:    &mockUserRepo{userID: "user-123"},
		Sessions: &mockSessionRepo{createSession: "session-abc"},
	}

	req := httptest.NewRequest(http.MethodGet, "/auth/slack/callback?code=validcode", nil)
	w := httptest.NewRecorder()
	h.SlackCallback()(w, req)

	if w.Code != http.StatusSeeOther {
		t.Fatalf("expected 303, got %d", w.Code)
	}

	// Check cookie was set
	cookies := w.Result().Cookies()
	var sessionCookie *http.Cookie
	for _, c := range cookies {
		if c.Name == "session" {
			sessionCookie = c
		}
	}
	if sessionCookie == nil {
		t.Fatal("expected session cookie to be set")
	}
	if sessionCookie.Value != "session-abc" {
		t.Errorf("expected session-abc, got %s", sessionCookie.Value)
	}

	// Check redirect location
	if loc := w.Header().Get("Location"); loc != "https://myapp.com/login/callback" {
		t.Errorf("unexpected redirect location: %s", loc)
	}
}

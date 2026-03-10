package handler_test

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"record-pool/handler"
	"record-pool/internal/domain"
	"record-pool/internal/track"

	"github.com/google/uuid"
)

// Compile-time interface checks — will tell you exactly what's missing
var _ domain.TrackRepository = &mockTrackRepo{}
var _ domain.ObjectStore = &mockObjectStore{}

// --- Mocks ---

type mockTrackRepo struct {
	tracks           []domain.Track
	addTrackErr      error
	getNameAndFmtErr error
	name, format     string
}

func (m *mockTrackRepo) ListAllTracks(ctx context.Context) ([]domain.Track, error) {
	if m.addTrackErr != nil { // reuse field for list error if needed
		return nil, m.addTrackErr
	}
	return m.tracks, nil
}

func (m *mockTrackRepo) GetNameAndFormat(ctx context.Context, hash string) (string, string, error) {
	return m.name, m.format, m.getNameAndFmtErr
}

func (m *mockTrackRepo) AddTrack(ctx context.Context, t track.Metadata, size int64) error {
	return m.addTrackErr
}

type mockObjectStore struct {
	getTrackErr error
	uploadErr   error
	body        string
	size        int64
}

func (m *mockObjectStore) Upload(ctx context.Context, objectName string, reader io.Reader, size int64) error {
	return m.uploadErr
}

func (m *mockObjectStore) GetTrack(ctx context.Context, fileName string) (io.ReadCloser, int64, error) {
	if m.getTrackErr != nil {
		return nil, 0, m.getTrackErr
	}
	return io.NopCloser(strings.NewReader(m.body)), m.size, nil
}

func (m *mockObjectStore) UploadCollectionXML(ctx context.Context, userID uuid.UUID, reader io.Reader, size int64) error {
	return nil
}

// --- ListAllTracks ---

func TestListAllTracks_ReturnsTracksAsJSON(t *testing.T) {
	h := &handler.TrackHandler{
		Repo: &mockTrackRepo{
			tracks: []domain.Track{{Title: "Nightcall", Artist: "Kavinsky"}},
		},
		Store: &mockObjectStore{},
	}

	req := httptest.NewRequest(http.MethodGet, "/tracks", nil)
	w := httptest.NewRecorder()
	h.ListAllTracks()(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	if ct := w.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("expected application/json, got %s", ct)
	}

	var tracks []domain.Track
	if err := json.NewDecoder(w.Body).Decode(&tracks); err != nil {
		t.Fatalf("could not decode body: %v", err)
	}
	if len(tracks) != 1 || tracks[0].Title != "Nightcall" {
		t.Errorf("unexpected response: %+v", tracks)
	}
}

func TestListAllTracks_RepoError_Returns500(t *testing.T) {
	h := &handler.TrackHandler{
		Repo:  &mockTrackRepo{addTrackErr: errors.New("db down")},
		Store: &mockObjectStore{},
	}

	req := httptest.NewRequest(http.MethodGet, "/tracks", nil)
	w := httptest.NewRecorder()
	h.ListAllTracks()(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected 500, got %d", w.Code)
	}
}

// --- Download ---

func TestDownload_MissingFileParam_Returns400(t *testing.T) {
	h := &handler.TrackHandler{
		Repo:  &mockTrackRepo{},
		Store: &mockObjectStore{},
	}

	req := httptest.NewRequest(http.MethodGet, "/download", nil) // no ?file=
	w := httptest.NewRecorder()
	h.Download()(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestDownload_FileNotFound_Returns404(t *testing.T) {
	h := &handler.TrackHandler{
		Repo:  &mockTrackRepo{},
		Store: &mockObjectStore{getTrackErr: errors.New("not found")},
	}

	req := httptest.NewRequest(http.MethodGet, "/download?file=abc123", nil)
	w := httptest.NewRecorder()
	h.Download()(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d", w.Code)
	}
}

func TestDownload_Success_SetsHeaders(t *testing.T) {
	h := &handler.TrackHandler{
		Repo: &mockTrackRepo{
			name:   "Nightcall",
			format: "mp3",
		},
		Store: &mockObjectStore{body: "fake audio bytes", size: 16},
	}

	req := httptest.NewRequest(http.MethodGet, "/download?file=abc123", nil)
	w := httptest.NewRecorder()
	h.Download()(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	if cd := w.Header().Get("Content-Disposition"); cd != `attachment; filename="Nightcall.mp3"` {
		t.Errorf("unexpected Content-Disposition: %s", cd)
	}
	if cl := w.Header().Get("Content-Length"); cl != "16" {
		t.Errorf("unexpected Content-Length: %s", cl)
	}
	if w.Body.String() != "fake audio bytes" {
		t.Errorf("unexpected body: %s", w.Body.String())
	}
}

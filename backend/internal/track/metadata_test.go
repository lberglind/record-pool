package track_test

import (
	"os"
	"record-pool/internal/track"
	"testing"
)

func TestExtractMetadata(t *testing.T) {
	f, err := os.Open("testdata/sample.mp3")
	if err != nil {
		t.Fatalf("could not open test fixture: %v", err)
	}
	defer f.Close()

	meta, err := track.ExtractMetadata(f)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if meta.Hash == "" {
		t.Error("Expected a non-empty hash")
	}
	if meta.FileType == "" {
		t.Error("Expected a non-empty file type")
	}
}

func TestExtractMetadata_InvalidFile(t *testing.T) {
	f, err := os.CreateTemp("", "not_a_song_*.txt")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(f.Name())

	f.WriteString("This is just some text, not music metadata")
	f.Seek(0, 0)

	_, err = track.ExtractMetadata(f)
	if err == nil {
		t.Fatalf("Expected an error when parsing a non-mp3 file, but got nil")
	}
}

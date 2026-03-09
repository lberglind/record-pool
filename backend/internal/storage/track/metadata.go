package track

import (
	"fmt"
	"mime/multipart"
	"strings"

	"github.com/dhowden/tag"
)

type Metadata struct {
	Hash     string
	Title    string
	Artist   string
	FileType string
}

func ExtractMetadata(file multipart.File) (Metadata, error) {
	// 1. Hash the file
	hash, err := tag.Sum(file)
	if err != nil {
		return Metadata{}, fmt.Errorf("Failed to create audio checksum")
	}

	// 2. Reset file pointer and get Tags
	_, err = file.Seek(0, 0)
	if err != nil {
		return Metadata{}, fmt.Errorf("Failed to reset file pointer")
	}

	m, err := tag.ReadFrom(file)
	if err != nil {
		return Metadata{}, fmt.Errorf("Failed to read tags from file")
	}
	title := m.Title()
	artist := m.Artist()
	fileType := strings.ToLower(string(m.FileType()))

	// 3. Reset file pointer and get duration
	_, err = file.Seek(0, 0)
	if err != nil {
		return Metadata{}, fmt.Errorf("Failed to reset file pointer")
	}

	return Metadata{
		Hash:     hash,
		Title:    title,
		Artist:   artist,
		FileType: fileType,
	}, nil
}

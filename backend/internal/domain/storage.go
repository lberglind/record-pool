package domain

import (
	"context"
	"io"

	"github.com/google/uuid"
)

type ObjectStore interface {
	Upload(ctx context.Context, objectName string, reader io.Reader, size int64) error
	UploadCover(ctx context.Context, hahs, objectName string, data []byte) error
	GetTrack(ctx context.Context, fileName string) (io.ReadCloser, int64, error)
	UploadCollectionXML(ctx context.Context, userID uuid.UUID, reader io.Reader, size int64) error
}

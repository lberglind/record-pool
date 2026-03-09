package domain

import (
	"context"
	"io"
)

type ObjectStore interface {
	Upload(ctx context.Context, objectName string, reader io.Reader, size int64) error
	GetTrack(ctx context.Context, fileName string) (io.ReadCloser, int64, error)
}

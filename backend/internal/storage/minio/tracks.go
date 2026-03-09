package minio

import (
	"context"
	"io"
	"log"
	"os"

	"github.com/minio/minio-go/v7"
)

type ObjectStore struct {
	Client *minio.Client
}

func NewObjectStore(client *minio.Client) *ObjectStore {
	return &ObjectStore{Client: client}
}

func (s *ObjectStore) Upload(ctx context.Context, objectName string, reader io.Reader, size int64) error {
	bucketName := os.Getenv("MINIO_BUCKET_TRACKS")
	contentType := "audio/mpeg"
	_, err := s.Client.PutObject(ctx, bucketName, objectName, reader, size, minio.PutObjectOptions{ContentType: contentType})
	return err
}

func (s *ObjectStore) GetTrack(ctx context.Context, fileName string) (io.ReadCloser, int64, error) {
	object, err := s.Client.GetObject(ctx, os.Getenv("MINIO_BUCKET_TRACKS"), fileName, minio.GetObjectOptions{})
	if err != nil {
		log.Printf("File not found: %v\n", err)
		return nil, 0, err
	}
	stat, err := object.Stat()
	if err != nil {
		log.Printf("MinIO Stat Error for %s: %v\n", fileName, err)
		return nil, 0, err
	}
	return object, stat.Size, nil
}

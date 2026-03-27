package minio

import (
	"context"
	"log"
	"os"
	"strconv"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func NewClient() *minio.Client {
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKeyID := os.Getenv("MINIO_ROOT_USER")
	secretAccessKey := os.Getenv("MINIO_ROOT_PASSWORD")
	useSSL, _ := strconv.ParseBool(os.Getenv("MINIO_USE_SSL"))
	buckets := [3]string{"tracks", "albumcovers", "xmlcollections"}

	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalf("Critical: minioClient failed: %v\n", err)
	}
	log.Println("minioClient now set up")

	ctx := context.Background()
	for _, bucket := range buckets {
		exists, err := minioClient.BucketExists(ctx, bucket)
		if err != nil {
			log.Printf("Warning: Could not check bucket status: %v\n", err)
		} else if !exists {
			log.Printf("Bucket %s does not exist. Creating it..\n", bucket)
			err = minioClient.MakeBucket(ctx, bucket, minio.MakeBucketOptions{})
			if err != nil {
				log.Printf("Error creating bucket: %v\n", err)
			}
		}
	}

	return minioClient
}

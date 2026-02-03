package minioInteract

import (
	"context"
	"log"
	"os"
	"strconv"

	utils "record-pool/utils"

	"github.com/joho/godotenv"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func Connect() *minio.Client {
	err := godotenv.Load()
	utils.CheckErr(err)

	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKeyID := os.Getenv("MINIO_ROOT_USER")
	secretAccessKey := os.Getenv("MINIO_ROOT_PASSWORD")
	useSSL, _ := strconv.ParseBool(os.Getenv("MINIO_USE_SSL"))

	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	utils.CheckErr(err)
	log.Printf("%#v\n", minioClient) // minioClient now set up

	return minioClient
}

// Upload file
func UploadFile(ctx context.Context, minioClient *minio.Client, objectName, filePath string) {
	bucketName := os.Getenv("MINIO_BUCKET_TRACKS")
	contentType := "audio/mpeg"
	info, err := minioClient.FPutObject(ctx, bucketName, objectName, filePath, minio.PutObjectOptions{ContentType: contentType})
	utils.CheckErr(err)
	log.Printf("Successfully uploaded %s of size %d\n", objectName, info.Size)
}

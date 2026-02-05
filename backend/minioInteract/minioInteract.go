package storage

import (
	"context"
	"log"
	"os"
	"strconv"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func Init() *minio.Client {
	//err := godotenv.Load() // Only used when not running in Docker
	//if err != nil {
	//	log.Println("Couldn't find file .env, uses system variables")
	//}

	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKeyID := os.Getenv("MINIO_ROOT_USER")
	secretAccessKey := os.Getenv("MINIO_ROOT_PASSWORD")
	useSSL, _ := strconv.ParseBool(os.Getenv("MINIO_USE_SSL"))
	bucketName := os.Getenv("MINIO_BUCKET_TRACKS")

	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalf("Critical: minioClient failed: %v\n", err)
	}
	log.Println("minioClient now set up")

	ctx := context.Background()
	exists, err := minioClient.BucketExists(ctx, bucketName)
	if err != nil {
		log.Printf("Warning: Could not check bucket status: %v\n", err)
	} else if !exists {
		log.Printf("Bucket %s does not exist. Creating it..\n", bucketName)
		err = minioClient.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			log.Printf("Error creating bucket: %v\n", err)
		}
	}

	return minioClient
}

// Upload file
func UploadFile(ctx context.Context, minioClient *minio.Client, objectName, filePath string) {
	bucketName := os.Getenv("MINIO_BUCKET_TRACKS")
	contentType := "audio/mpeg"
	info, err := minioClient.FPutObject(ctx, bucketName, objectName, filePath, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		log.Printf("Could not upload file to minio: %v\n", err)
	}
	log.Printf("Successfully uploaded %s of size %d\n", objectName, info.Size)
}

func FetchAllFilenames(ctx context.Context, minioClient *minio.Client) ([]string, error) {
	var filenames []string
	bucketName := os.Getenv("MINIO_BUCKET_TRACKS")
	objectCh := minioClient.ListObjects(ctx, bucketName, minio.ListObjectsOptions{
		Recursive: true,
	})
	for object := range objectCh {
		if object.Err != nil {
			return nil, object.Err
		}
		filenames = append(filenames, object.Key)
	}
	return filenames, nil
}

func GetFile(ctx context.Context, minioClient *minio.Client, fileName string) (*minio.Object, error) {
	object, err := minioClient.GetObject(ctx, os.Getenv("MINIO_BUCKET_TRACKS"), fileName, minio.GetObjectOptions{})
	if err != nil {
		log.Printf("File not found: %v\n", err)
		return nil, err
	}
	return object, err
}

package api

import (
	"context"

	db "record-pool/dbInteract"
	"record-pool/minioInteract"
	"record-pool/utils"

	"github.com/jackc/pgx/v5"
	"github.com/minio/minio-go/v7"
)

func Upload(ctx context.Context, conn *pgx.Conn, minioClient *minio.Client, filePath string) {
	hash, err := db.AddTrack(ctx, conn, filePath)
	utils.CheckErr(err)
	minioInteract.UploadFile(ctx, minioClient, hash, filePath)
}

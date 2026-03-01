package core

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/minio/minio-go/v7"
)

type Container struct {
	DB    *pgxpool.Pool
	Minio *minio.Client
}

package postgres

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect(ctx context.Context) *pgxpool.Pool {
	pool, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Printf("Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	err = pool.Ping(ctx)
	if err != nil {
		log.Printf("Database unreachable: %v\n", err)
		os.Exit(1)
	}
	log.Println("Successfully connected to database!")
	return pool
}

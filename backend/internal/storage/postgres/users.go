package postgres

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepo struct {
	pool *pgxpool.Pool
}

func NewUserRepo(pool *pgxpool.Pool) *UserRepo {
	return &UserRepo{pool: pool}
}

func (r *UserRepo) UpsertUser(ctx context.Context, email, name, avatar string) (string, error) {
	var userID string

	query := `
		INSERT INTO users (email, name, avatar) 
		VALUES ($1, $2, $3) 
		ON CONFLICT (email) DO UPDATE SET 
		name = EXCLUDED.name,
		avatar = EXCLUDED.avatar
		RETURNING user_id`

	err := r.pool.QueryRow(ctx, query, email, name, avatar).Scan(&userID)
	if err != nil {
		log.Printf("Couldn't create user: %v", err)
		return "", err
	}
	log.Printf("User upserted with ID: %s\n", userID)

	return userID, nil
}

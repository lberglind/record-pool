package postgres

import (
	"context"
	"log"
	"record-pool/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LikeRepo struct {
	pool *pgxpool.Pool
}

func NewLikeRepo(pool *pgxpool.Pool) *LikeRepo {
	return &LikeRepo{pool: pool}
}

func (r *LikeRepo) LikeTrack(ctx context.Context, user uuid.UUID, track string) error {
	query := `
		INSERT INTO likes (user_id, track_hash)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING`
	_, err := r.pool.Exec(ctx, query, user, track)
	if err != nil {
		log.Printf("Couldn't add track like: %v", err)
		return err
	}
	return nil
}

func (r *LikeRepo) DeleteTrackLike(ctx context.Context, user uuid.UUID, track string) error {
	query := `DELETE FROM likes WHERE user_id = $1 AND track_hash = $2`
	_, err := r.pool.Exec(ctx, query, user, track)
	if err != nil {
		log.Printf("Couldn't delete track like")
		return err
	}
	return nil
}

func (r *LikeRepo) GetTrackLikesForUser(ctx context.Context, user uuid.UUID) ([]domain.Like, error) {
	query := `SELECT user_id, track_hash, created_at FROM likes WHERE user_id = $1`
	rows, err := r.pool.Query(ctx, query, user)
	if err != nil {
		log.Printf("Couldn't fetch likes for user")
		return nil, err
	}
	defer rows.Close()

	likes := []domain.Like{}
	for rows.Next() {
		var l domain.Like
		err := rows.Scan(
			&l.User,
			&l.Track,
			&l.Timestamp)
		if err != nil {
			continue
		}
		likes = append(likes, l)
	}
	return likes, nil
}

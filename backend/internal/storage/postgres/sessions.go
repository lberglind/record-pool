package postgres

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SessionRepo struct {
	pool *pgxpool.Pool
}

func NewSessionRepo(pool *pgxpool.Pool) *SessionRepo {
	return &SessionRepo{pool: pool}
}

func (r *SessionRepo) CreateSession(ctx context.Context, userID string) (string, error) {
	var sessionID string

	query := `
		INSERT INTO sessions (user_id, expires)
		VALUES ($1, NOW() + INTERVAL '7 days')
		RETURNING session_id`

	err := r.pool.QueryRow(ctx, query, userID).Scan(&sessionID)
	if err != nil {
		return "", err
	}
	return sessionID, err
}

func (r *SessionRepo) UserFromSession(ctx context.Context, session string) (string, uuid.UUID, error) {
	var email string
	var userID uuid.UUID

	query := `
		SELECT u.email, u.user_id FROM users u
		JOIN sessions s ON u.user_id = s.user_id
		WHERE s.session_id = $1
		AND s.expires > NOW()
		`
	err := r.pool.QueryRow(ctx, query, session).Scan(&email, &userID)
	if err != nil {
		return "", uuid.Nil, err
	}
	return email, userID, err
}

func (r *SessionRepo) StartCleanup(interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for range ticker.C {
		_, err := r.pool.Exec(context.Background(), `DELETE FROM sessions WHERE expires < NOW()`)
		if err != nil {
			log.Printf("Session cleanup error: %v", err)
		}
	}
}

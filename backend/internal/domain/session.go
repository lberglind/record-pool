package domain

import (
	"context"

	"github.com/google/uuid"
)

type SessionRepository interface {
	CreateSession(ctx context.Context, userID string) (string, error)
	UserFromSession(ctx context.Context, session string) (email string, userID uuid.UUID, err error)
}

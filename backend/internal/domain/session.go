package domain

import "context"

type SessionRepository interface {
	CreateSession(ctx context.Context, userID string) (string, error)
	EmailFromSession(ctx context.Context, session string) (string, error)
}

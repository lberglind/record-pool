package domain

import "context"

type UserRepository interface {
	UpsertUser(ctx context.Context, email, name, avatar string) (string, error)
}

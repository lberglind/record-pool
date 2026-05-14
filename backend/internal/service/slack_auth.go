package service

import "context"

type AuthUser struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
}

type SlackAuth interface {
	AuthCodeURL(state string) string
	UserFromCode(ctx context.Context, code string) (*AuthUser, error)
}

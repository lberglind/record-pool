package service

import "context"

type AuthUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

type SlackAuth interface {
	AuthCodeURL(state string) string
	UserFromCode(ctx context.Context, code string) (*AuthUser, error)
	GetUserInfo(ctx context.Context, token, id string) (*AuthUser, error)
}

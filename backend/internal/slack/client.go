package slack

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"record-pool/internal/service"

	"golang.org/x/oauth2"
)

type slackUserInfoResponse struct {
	OK   bool      `json:"ok"`
	User slackUser `json:"user"`
}

type slackUser struct {
	ID      string           `json:"id"`
	TeamID  string           `json:"team_id"`
	Name    string           `json:"name"`
	Profile slackUserProfile `json:"profile"`
}

type slackUserProfile struct {
	Email    string `json:"email"`
	RealName string `json:"real_name"`
}

type AuthService struct {
	OAuth *oauth2.Config
	HTTP  *http.Client
}

func NewAuthService(oauth *oauth2.Config, httpClient *http.Client) *AuthService {
	return &AuthService{
		OAuth: oauth,
		HTTP:  httpClient,
	}
}

func NewConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     os.Getenv("SLACK_CLIENT_ID"),
		ClientSecret: os.Getenv("SLACK_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("REDIRECT_URL"),
		Scopes:       []string{"users:read", "users:read.email"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://slack.com/oauth/v2/authorize",
			TokenURL: "https://slack.com/api/oauth.v2.access",
		},
	}
}

func (s *AuthService) AuthCodeURL(state string) string {
	return s.OAuth.AuthCodeURL(
		state,
		oauth2.SetAuthURLParam("user_scope", "users:read,users:read.email"),
	)
}

func (s *AuthService) UserFromCode(ctx context.Context, code string) (*service.AuthUser, error) {
	token, err := s.OAuth.Exchange(ctx, code)
	if err != nil {
		return nil, err
	}
	raw, ok := token.Extra("authed_user").(map[string]any)
	if !ok {
		return nil, fmt.Errorf("could not find authed_user in token")
	}

	userAccessToken, ok := raw["access_token"].(string)
	if !ok || userAccessToken == "" {
		return nil, fmt.Errorf("missing authed_user access_token")
	}

	userID, _ := raw["id"].(string)
	if userID == "" {
		return nil, fmt.Errorf("missing authed_user id")
	}
	return s.getUserInfo(userAccessToken, userID)
}

func (s *AuthService) getUserInfo(accessToken, userID string) (*service.AuthUser, error) {
	req, err := http.NewRequest("GET",
		fmt.Sprintf("https://slack.com/api/users.info?user=%s", userID),
		nil,
	)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	res, err := s.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var info slackUserInfoResponse
	if err := json.NewDecoder(res.Body).Decode(&info); err != nil {
		return nil, err
	}

	if !info.OK {
		return nil, fmt.Errorf("Slack users.info returned not ok")
	}
	return &service.AuthUser{
		ID:    info.User.ID,
		Email: info.User.Profile.Email,
		Name:  info.User.Name,
	}, nil

}

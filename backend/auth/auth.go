package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	db "record-pool/dbInteract"
	core "record-pool/internal"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/oauth2"
)

// For PoC
var sessions = map[string]string{}

type AuthTestResponse struct {
	OK     bool   `json:"ok"`
	UserID string `json:"user_id"`
	TeamID string `json:"team_id"`
}

type SlackUserProfile struct {
	Email    string `json:"email"`
	RealName string `json:"real_name"`
}

type SlackUser struct {
	ID      string           `json:"id"`
	TeamID  string           `json:"team_id"`
	Name    string           `json:"name"`
	Profile SlackUserProfile `json:"profile"`
}

type SlackUserInfoResponse struct {
	OK   bool      `json:"ok"`
	User SlackUser `json:"user"`
}

type DatabaseProvider interface {
	GetPool() *pgxpool.Pool
}

var slackOAuthConfig *oauth2.Config

func Init() {
	slackOAuthConfig = &oauth2.Config{
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

func SlackLogInHandler(w http.ResponseWriter, r *http.Request) {
	url := slackOAuthConfig.AuthCodeURL("random-state-string",
		oauth2.SetAuthURLParam("user_scope", "users:read,users:read.email"))

	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func GetSlackUserInfo(accessToken, userID string) (*SlackUser, error) {
	req, err := http.NewRequest("GET",
		fmt.Sprintf("https://slack.com/api/users.info?user=%s", userID),
		nil,
	)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var info SlackUserInfoResponse
	if err := json.NewDecoder(res.Body).Decode(&info); err != nil {
		return nil, err
	}

	if !info.OK {
		return nil, fmt.Errorf("Slack users.info returned not ok")
	}

	return &info.User, nil
}

func SlackCallbackHandler(c *core.Container) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		code := r.URL.Query().Get("code")
		if code == "" {
			http.Error(w, "No code in request", http.StatusBadRequest)
			return
		}

		token, err := slackOAuthConfig.Exchange(r.Context(), code)
		if err != nil {
			http.Error(w, "Failed to exchange token "+err.Error(), http.StatusInternalServerError)
			return
		}
		raw, ok := token.Extra("authed_user").(map[string]interface{})
		if !ok {
			http.Error(w, "Could not find user token", 500)
			return
		}

		userAccessToken, ok := raw["access_token"].(string)
		if !ok {
			http.Error(w, "User Token is missing", 500)
			return
		}

		userID, _ := raw["id"].(string)

		user, err := GetSlackUserInfo(userAccessToken, userID)
		if err != nil {
			http.Error(w, "Failer to get user info: "+err.Error(), http.StatusInternalServerError)
			return
		}
		fmt.Printf("DEBUG: User ID: %s, Email: %s, Name: %s, RealName: %s\n", user.ID, user.Profile.Email, user.Name, user.Profile.RealName)

		// For PoC, Later store in database
		sessionID, err := db.AddUser(r.Context(), c.DB, user.Profile.Email, user.Name)
		if err != nil {
			http.Error(w, "Failed the database checks: "+err.Error(), http.StatusInternalServerError)
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "session",
			Value:    sessionID,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteNoneMode, // allows sending cookie on redirect
			MaxAge:   int((24 * 7 * time.Hour).Seconds()),
		})
		http.Redirect(w, r, os.Getenv("FRONTEND_URL")+"/login/callback", http.StatusSeeOther)
		// http.Redirect(w, r, os.Getenv("FRONTEND_URL"), http.StatusSeeOther)
	}
}

func MeHandler(c *core.Container) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			http.Error(w, "Not logged in", http.StatusUnauthorized)
			return
		}

		sessionID := cookie.Value

		email, err := db.GetEmailFromSession(r.Context(), c.DB, sessionID)

		fmt.Println(email)
		if err != nil {
			http.Error(w, "Invalid session", http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"email": email,
		})
	}
}

func SlackAuthTest(accessToken string) (*AuthTestResponse, error) {
	req, err := http.NewRequest("GET", "https://slack.com/api/auth.test", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	client := http.DefaultClient
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var authTest AuthTestResponse
	if err := json.NewDecoder(res.Body).Decode(&authTest); err != nil {
		return nil, err
	}

	if !authTest.OK {
		return nil, fmt.Errorf("Slack API returned not ok")
	}

	return &authTest, nil
}

package slack

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

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

func Init() *oauth2.Config {
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

func SlackLogInHandler(cfg *oauth2.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		url := slackOAuthConfig.AuthCodeURL("random-state-string",
			oauth2.SetAuthURLParam("user_scope", "users:read,users:read.email"))

		http.Redirect(w, r, url, http.StatusTemporaryRedirect)
	}
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

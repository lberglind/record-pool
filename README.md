# Record Pool

A self-hosted private record pool built with docker, go, minIO and postgres

## The idea

Share your songs and playlists with friends easily.
Possible to upload both audio files and Rekordbox XML.
Download a song with its XML to keep beatgrid and cuepoints.

## Code

Backend: Go

Music Storage: minIO

Database: postgres

Frontend: next.js

ngrok and Caddy for reverse proxy during development (needed for slack authentication)


## Setup

I currently use tmux to run the different scripts in different windows for dev purposes.

- Set up environment variables. Can be found in `.env_example`. All environment variables
should at the moment be in the root directory except for `NEXT_PUBLIC_API_URL` which should be in frontend/.env

- ngrok env variables (link) can be found when running ngrok http 8000
- add `/api/auth/slack/callback` to redirect url


- Set up a Slack app in your favorite workspace. 
  - Navigate to https://api.slack.com/apps and set up a new app. Go to `OAuth & Permissions` in the sidebar and input your personal ngrok link followed by `/api/auth/slack/callback`. 
Like so: `https://<my-personal-link>.ngrok-free.dev/api/auth/slack/callback`
  - Add the bot token scope `chat:write` and the user scopes `users:read` and `users:read.email`.
  - Navigate to `Install App` in the sidebar and install the app to your workspace.
  - Navigate to `Basic Information` and copy your Client ID and Client Secret to your environment variables add to .env


- Run docker containers: `$ docker compose up -d`

- Access postgres to initialise tables:
  - Copy all tables in init-db/schema.psql
  - `record-pool % psql -h localhost -p 5432 -U admin -d recordpool`
  - Paste tables

- Start go backend: 
```
$ cd backend/
$ go run cmd/api/main.go
```

The API can be reached on localhost:8080/swagger/index.html

- Start frontend:
```
$ cd frontend/
$ npm install
$ npm run dev
```

- Start Reverse Proxy: 
```
$ caddy run
$ ngrok http 8000
```

The project can now be accessed through your personal ngrok link


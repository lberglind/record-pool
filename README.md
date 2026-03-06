# Record Pool

A self-hosted private record pool built with docker, go, minIO and postgres

## The idea

Share your songs and playlists with friends easily.
Possible to upload both audio files and Rekordbox XML.
Download a song with its XML to keep beatgrid and cuepoints.

## Code

Backend: Go

Music Storage: minIO

Databse: postgres

Frontend: next.js

ngrok and Caddy for reverse proxy during development (needed for slack authentication)


## Setup

I currently use tmux to run the different scripts in different windows for dev purposes.

- Set up environment variables. Can be found in `.env_example`

- Run docker containers: `$ docker compose up -d`

- Start go backend: 
```
$ cd backend/
$ go run main.go
```

- Start frontend:
```
$ cd record-pool-frontend/
$ npm install
$ npm run dev
```

- Start Reverse Proxy: 
```
$ caddy run
$ ngrok http 8000
```

The project can now be accessed through your personal ngrok link





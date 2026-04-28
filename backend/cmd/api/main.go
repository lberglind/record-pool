package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"record-pool/handler"
	"record-pool/middleware"
	"time"

	_ "record-pool/docs"
	"record-pool/internal/service"
	"record-pool/internal/slack"
	"record-pool/internal/storage/minio"
	"record-pool/internal/storage/postgres"

	"github.com/joho/godotenv"
	httpSwagger "github.com/swaggo/http-swagger/v2"
)

// @title Record Pool API
// @version 1.0
// @description This is a music record pool server.
// @host localhost:8080
// @BasePath /
func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		log.Println("Couldn't find file .env, uses system variables")
	}

	// Initialize dependencies
	ctx := context.Background()
	pool := postgres.Connect(ctx)
	defer pool.Close()
	minioClient := minio.NewClient()

	// Repos and storage
	trackRepo := postgres.NewTrackRepo(pool)
	userRepo := postgres.NewUserRepo(pool)
	sessionRepo := postgres.NewSessionRepo(pool)
	go sessionRepo.StartCleanup(24 * time.Hour)
	metadataRepo := postgres.NewTrackMetadataRepo(pool)
	stagingRepo := postgres.NewXMLStagingRepo(pool)
	profileRepo := postgres.NewProfileRepo(pool)
	playlistRepo := postgres.NewPlaylistRepo(pool)
	searchRepo := postgres.NewSearchRepo(pool)
	likeRepo := postgres.NewLikeRepo(pool)

	trackStorage := minio.NewObjectStore(minioClient)

	// Services
	slackConfig := slack.NewConfig()
	slackAuth := slack.NewAuthService(slackConfig, http.DefaultClient)

	xmlSync := &service.XMLSyncService{
		Staging:   stagingRepo,
		Metadata:  metadataRepo,
		Playlists: playlistRepo,
	}

	// Handlers
	trackHandlers := handler.TrackHandler{
		Repo:         trackRepo,
		MetadataRepo: metadataRepo,
		StagingRepo:  stagingRepo,
		XMLSync:      xmlSync,
		Store:        trackStorage,
	}
	sessionHandlers := handler.SessionHandler{Repo: sessionRepo}

	authHandlers := handler.AuthHandler{
		Users:    userRepo,
		Sessions: sessionRepo,
		Auth:     slackAuth,
	}

	profileHandlers := handler.ProfileHandler{
		Repo: profileRepo,
	}

	playlistHandlers := handler.PlaylistHandler{
		Repo: playlistRepo,
	}

	searchHandlers := handler.SearchHandler{
		Repo: searchRepo,
	}

	likeHandlers := handler.LikeHandler{
		Repo: likeRepo,
	}

	mux := http.NewServeMux()
	protected := func(h http.HandlerFunc) http.HandlerFunc {
		return middleware.RequireAuth(sessionRepo, h)
	}

	mux.Handle("/swagger/", httpSwagger.WrapHandler)

	// Map API Endpoints to functions
	// Protected Routes

	mux.HandleFunc("GET /tracks", protected(trackHandlers.ListAllTracks()))
	mux.HandleFunc("GET /tracks/page", protected(trackHandlers.ListTrackPage()))
	mux.HandleFunc("GET /tracks/{hash}/file", protected(trackHandlers.Download()))
	mux.HandleFunc("POST /tracks", protected(trackHandlers.Upload()))
	mux.HandleFunc("POST /xml", protected(trackHandlers.UploadXML()))
	mux.HandleFunc("POST /tracks/batch", protected(trackHandlers.BatchUpload()))
	mux.HandleFunc("GET /profile", protected(profileHandlers.GetProfile()))
	mux.HandleFunc("POST /likes/{hash}", protected(likeHandlers.LikeTrack()))
	mux.HandleFunc("DELETE /likes/{hash}", protected(likeHandlers.DeleteTrackLike()))
	mux.HandleFunc("GET /likes", protected(likeHandlers.GetTrackLikesForUser()))

	// Search Routes
	mux.HandleFunc("GET /search", protected(searchHandlers.TrackSearch()))

	// Playlist routes
	mux.HandleFunc("GET /playlists", protected(playlistHandlers.GetTree()))
	mux.HandleFunc("POST /playlists", protected(playlistHandlers.Create()))
	mux.HandleFunc("GET /playlists/{id}", protected(playlistHandlers.Get()))
	mux.HandleFunc("DELETE /playlists/{id}", protected(playlistHandlers.Delete()))
	mux.HandleFunc("POST /playlists/{id}/tracks", protected(playlistHandlers.AddTrack()))
	mux.HandleFunc("DELETE /playlists/{id}/tracks/{hash}", protected(playlistHandlers.RemoveTrack()))

	// Public Routes
	mux.HandleFunc("GET /auth/slack", authHandlers.SlackLogIn())
	mux.HandleFunc("GET /auth/slack/callback", authHandlers.SlackCallback())
	mux.HandleFunc("GET /me", sessionHandlers.Me())

	// Execution. Keep processes alive
	finalHandler := logger(enableCORS(mux))
	log.Println("Backend is live on port 8080")
	if err := http.ListenAndServe(":8080", finalHandler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s %s", r.Method, r.URL.Path, r.RemoteAddr)
		next.ServeHTTP(w, r)
	})
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("FRONTEND_URL"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

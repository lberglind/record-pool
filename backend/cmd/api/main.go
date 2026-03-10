package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"record-pool/handler"
	"record-pool/middleware"

	"record-pool/internal/service"
	"record-pool/internal/slack"
	"record-pool/internal/storage/minio"
	"record-pool/internal/storage/postgres"

	"github.com/joho/godotenv"
)

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
	metadataRepo := postgres.NewTrackMetadataRepo(pool)
	stagingRepo := postgres.NewXMLStagingRepo(pool)
	profileRepo := postgres.NewProfileRepo(pool)
	trackStorage := minio.NewObjectStore(minioClient)

	// Services
	slackConfig := slack.NewConfig()
	slackAuth := slack.NewAuthService(slackConfig, http.DefaultClient)

	xmlSync := &service.XMLSyncService{
		Staging:  stagingRepo,
		Metadata: metadataRepo,
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

	// Map API Endpoints to functions
	// Protected Routes
	http.HandleFunc("/tracks", enableCORS(middleware.RequireAuth(sessionRepo, trackHandlers.ListAllTracks())))
	http.HandleFunc("/download", enableCORS(middleware.RequireAuth(sessionRepo, trackHandlers.Download())))
	http.HandleFunc("/upload", enableCORS(middleware.RequireAuth(sessionRepo, trackHandlers.Upload())))
	http.HandleFunc("/upload/xml", enableCORS(middleware.RequireAuth(sessionRepo, trackHandlers.UploadXML())))
	http.HandleFunc("/profile", enableCORS(middleware.RequireAuth(sessionRepo, profileHandlers.GetProfile())))

	// Public Routes
	http.HandleFunc("/auth/slack", enableCORS(authHandlers.SlackLogIn()))
	http.HandleFunc("/auth/slack/callback", enableCORS(authHandlers.SlackCallback()))
	http.HandleFunc("/me", enableCORS(sessionHandlers.Me()))

	// Execution. Keep processes alive
	log.Println("Backend is live on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("FRONTEND_URL"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

package main

import (
	"context"
	"time"

	"record-pool/api"
	db "record-pool/dbInteract"
	minioInteract "record-pool/minioInteract"
)

func main() {
	ctx := context.Background()
	conn := db.Init()
	defer func() {
		_ = conn.Close(ctx)
	}()

	requestCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// Test vars
	filePath := "/Users/ludwigberglind/Music/Platoon/Skrillex - Rumble.mp3"
	// End Test vars

	// db.CreateUser(queryCtx, conn, "erik@test.se", "erik")
	// hash, err := db.AddTrack(queryCtx, conn, filePath)
	// utils.CheckErr(err)
	minioClient := minioInteract.Connect()
	// objectName := hash
	// minioInteract.UploadFile(ctx, minioClient, objectName, filePath)

	api.Upload(requestCtx, conn, minioClient, filePath)
}

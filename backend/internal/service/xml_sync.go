package service

import (
	"context"
	"fmt"
	"log"
	"record-pool/internal/domain"
	"record-pool/parser"

	"github.com/google/uuid"
)

type XMLSyncService struct {
	Staging   domain.XMLStagingRepository
	Metadata  domain.TrackMetadataRepository
	Playlists domain.PlaylistRepository
}

// TrySync is called when a new audio file or XML has been uploaded.
// It looks for any staged XML entries for the user that matches the filename
// and promotes them to track_metadata
func (s *XMLSyncService) TrySync(ctx context.Context, uploadedBy uuid.UUID, rb *parser.RekordBox) {
	entries, err := s.Staging.FindUnmatchedByTitleArtistSize(ctx, uploadedBy)
	if err != nil {
		log.Printf("xml sync: failed to query staging: %v\n", err)
	}
	for _, e := range entries {
		if err := s.PromoteToMetadata(ctx, e, e.TrackHash); err != nil {
			log.Printf("xml sync: failed to promote entry %d: %v\n", e.ID, err)
			continue
		}
		if err := s.Staging.MarkSynced(ctx, e.ID, e.TrackHash); err != nil {
			log.Printf("xml sync: failed to mark entry %d as synced: %v", e.ID, err)
			continue
		}
	}

	// When hashes are set, import/refresh playlists if we have an XML
	if rb != nil {
		if err := s.ImportPlaylists(ctx, uploadedBy, rb); err != nil {
			log.Printf("xml sync: playlist import failed: %v\n", err)
		}
	}

	s.backfillPlaylistTracks(ctx, uploadedBy)
}

func (s *XMLSyncService) PromoteToMetadata(ctx context.Context, e domain.XMLStagingEntry, trackHash string) error {
	return s.Metadata.Upsert(ctx, domain.TrackMetadata{
		TrackHash:  trackHash,
		UploadedBy: &e.UploadedBy,
		BPM:        &e.BPM,
		Comments:   &e.Comments,
		Remixer:    &e.Remixer,
		Label:      &e.Label,
		Mix:        &e.Mix,
		Genre:      &e.Genre,
		Composer:   &e.Composer,
		DateAdded:  &e.DateAdded,
		PlayCount:  &e.PlayCount,
		Rating:     &e.Rating,
		Tonality:   &e.Tonality,
		Beatgrid:   e.Beatgrid,
		CuePoints:  e.CuePoints,
		CreatedAt:  &e.CreatedAt,
	})
}

func (s *XMLSyncService) ImportPlaylists(ctx context.Context, userID uuid.UUID, rb *parser.RekordBox) error {
	if len(rb.Playlists) == 0 {
		return nil
	}

	if err := s.Playlists.DeleteImportedForUser(ctx, userID); err != nil {
		return fmt.Errorf("import playlists: failed to clear existing: %w", err)
	}

	root := rb.Playlists[0]
	for i, node := range root.Nodes {
		if err := s.importNode(ctx, userID, node, nil, i); err != nil {
			log.Printf("import playlists: node %q: %v\n", node.Name, err)
		}
	}
	return nil
}

func (s *XMLSyncService) importNode(ctx context.Context, userID uuid.UUID, node parser.Node, parentID *uuid.UUID, position int) error {
	isFolder := node.Type == 0
	playlist, err := s.Playlists.Create(ctx, userID, node.Name, parentID, isFolder, position, true)
	if err != nil {
		return err
	}

	// Leaf Playlist - add tracks by looking up their hash via RekordBoxID
	for _, tk := range node.Tracks {
		s.Staging.RecordPlaylistTrack(ctx, playlist.PlaylistID, userID, tk.Key)
		// Link immediately if audio already is uploaded
		hash, err := s.Staging.HashForRekordboxID(ctx, userID, tk.Key)
		if err != nil {
			continue
		}
		if err := s.Playlists.AddTrack(ctx, playlist.PlaylistID, hash); err != nil {
			log.Printf("import analysis: failed to add track %d to %q: %v\n", tk.Key, node.Name, err)
		}
	}
	for i, child := range node.Nodes {
		if err := s.importNode(ctx, userID, child, &playlist.PlaylistID, i); err != nil {
			log.Printf("import analysis: failed on child node %q: %v\n", child.Name, err)
		}
	}
	return nil
}

func (s *XMLSyncService) backfillPlaylistTracks(ctx context.Context, userID uuid.UUID) {
	entries, err := s.Staging.UnlinkedSyncedTracks(ctx, userID)
	if err != nil {
		log.Printf("xml sync: backfill query failed: %v\n", err)
		return
	}

	for _, e := range entries {
		playlists, err := s.Staging.PlaylistsForRekordboxID(ctx, userID, e.RekordboxID)
		if err != nil {
			continue
		}
		for _, playlistID := range playlists {
			s.Playlists.AddTrack(ctx, playlistID, e.TrackHash)
		}
	}
}

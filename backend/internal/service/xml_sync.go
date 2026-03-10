package service

import (
	"context"
	"log"
	"record-pool/internal/domain"

	"github.com/google/uuid"
)

type XMLSyncService struct {
	Staging  domain.XMLStagingRepository
	Metadata domain.TrackMetadataRepository
}

// TrySync is called when a new audio file or XML has been uploaded.
// It looks for any staged XML entries for the user that matches the filename
// and promotes them to track_metadata
func (s *XMLSyncService) TrySync(ctx context.Context, uploadedBy uuid.UUID) {
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
}

func (s *XMLSyncService) PromoteToMetadata(ctx context.Context, e domain.XMLStagingEntry, trackHash string) error {
	return s.Metadata.Upsert(ctx, domain.TrackMetadata{
		TrackHash:  trackHash,
		UploadedBy: &e.UploadedBy,
		BPM:        e.BPM,
		Duration:   e.Duration,
		Album:      e.Album,
		Comments:   e.Comments,
		Remixer:    e.Remixer,
		Label:      e.Label,
		Mix:        e.Mix,
		Genre:      e.Genre,
		Size:       e.Size,
		Year:       e.Year,
		Composer:   e.Composer,
		SampleRate: e.SampleRate,
		DateAdded:  e.DateAdded,
		PlayCount:  e.PlayCount,
		Rating:     e.Rating,
		BitRate:    e.Bitrate,
		Tonality:   e.Tonality,
		Beatgrid:   e.Beatgrid,
		CuePoints:  e.CuePoints,
		CreatedAt:  e.CreatedAt,
	})
}

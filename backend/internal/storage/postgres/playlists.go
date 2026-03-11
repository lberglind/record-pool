package postgres

import (
	"context"
	"record-pool/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PlaylistRepo struct {
	Pool *pgxpool.Pool
}

func NewPlaylistRepo(pool *pgxpool.Pool) *PlaylistRepo {
	return &PlaylistRepo{Pool: pool}
}

func (r *PlaylistRepo) Create(ctx context.Context, userID uuid.UUID, name string, parentID *uuid.UUID, isFolder bool, position int, imported bool) (*domain.Playlist, error) {
	var p domain.Playlist
	query := `INSERT INTO playlists (user_id, name, parent_id, isFolder, position, imported)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING playlist_id, name, parent_id, isFolder, position, imported, created_at`
	err := r.Pool.QueryRow(ctx, query, userID, name, parentID, isFolder, position, imported).Scan(&p.PlaylistID, &p.Name, &p.ParentID, &p.IsFolder, &p.Position, &p.Imported, &p.CreatedAt)
	if err != nil {
		return nil, err
	}
	p.Children = []domain.Playlist{}
	p.Tracks = []domain.Track{}
	return &p, nil
}

func (r *PlaylistRepo) GetTree(ctx context.Context, userID uuid.UUID) ([]domain.Playlist, error) {
	query := `SELECT playlist_id, parent_id, name, is_folder, position, created_at
		FROM playlists WHERE user_id = $1 ORDER BY position ASC`
	rows, err := r.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	byID := map[uuid.UUID]*domain.Playlist{}
	var order []uuid.UUID
	for rows.Next() {
		var p domain.Playlist
		if err := rows.Scan(&p.PlaylistID, &p.ParentID, &p.Name, &p.IsFolder, &p.Position, &p.CreatedAt); err != nil {
			continue
		}
		p.Children = []domain.Playlist{}
		p.Tracks = []domain.Track{}
		byID[p.PlaylistID] = &p
		order = append(order, p.PlaylistID)
	}

	query = `SELECT pt.playlist_id, t.hash, t.file_format, t.title, t.artist, t.created_at
		FROM playlist_tracks pt JOIN tracks t ON t.hash = pt.track_hash
		JOIN playlists p ON p.playlist_id = pt.playlist_id WHERE p.user_id = $1
		ORDER BY pt.added_at ASC`

	trackRows, err := r.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer trackRows.Close()

	for trackRows.Next() {
		var playlistID uuid.UUID
		var t domain.Track
		if err := trackRows.Scan(&playlistID, &t.Hash, &t.Format, &t.Title, &t.Artist, &t.CreatedAt); err != nil {
			continue
		}
		if p, ok := byID[playlistID]; ok {
			p.Tracks = append(p.Tracks, t)
		}
	}

	var roots []domain.Playlist
	for _, id := range order {
		p := byID[id]
		if p.ParentID == uuid.Nil {
			roots = append(roots, *p)
		} else {
			if parent, ok := byID[p.ParentID]; ok {
				parent.Children = append(parent.Children, *p)
			}
		}
	}

	return roots, nil
}

func (r *PlaylistRepo) Get(ctx context.Context, userID, playlistID uuid.UUID) (*domain.Playlist, error) {
	var p domain.Playlist
	query := `SELECT playlist_id, parent_id, name, is_folder, position, created_at FROM playlists
		WHERE user_id = $1 AND playlist_id = $2`
	err := r.Pool.QueryRow(ctx, query, userID, playlistID).Scan(&p.PlaylistID, &p.ParentID, &p.Name, &p.IsFolder, &p.Position, &p.CreatedAt)
	if err != nil {
		return nil, err
	}

	query = `SELECT t.hash, t.file_format, t.title, t.artist, t.created_at
		FROM tracks t JOIN playlist_tracks pt ON pt.track_hash = t.hash
		WHERE pt.playlist_id = $1 ORDER BY pt.added_at ASC`
	rows, err := r.Pool.Query(ctx, query, playlistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	p.Tracks = []domain.Track{}
	for rows.Next() {
		var t domain.Track
		if err := rows.Scan(&t.Hash, &t.Format, &t.Title, &t.Artist, &t.CreatedAt); err != nil {
			continue
		}
		p.Tracks = append(p.Tracks, t)
	}
	return &p, nil
}

func (r *PlaylistRepo) AddTrack(ctx context.Context, playlistID uuid.UUID, trackHash string) error {
	query := `INSERT INTO playlist_tracks (playlist_id, track_hash) values ($1, $2) ON CONFLICT DO NOTHING`
	_, err := r.Pool.Exec(ctx, query, playlistID, trackHash)
	return err
}

func (r *PlaylistRepo) RemoveTrack(ctx context.Context, playlistID uuid.UUID, trackHash string) error {
	query := `DELETE FROM playlist_tracks WHERE playlist_id = $1 AND track_hash = $2`
	_, err := r.Pool.Exec(ctx, query, playlistID, trackHash)
	return err
}

func (r *PlaylistRepo) Delete(ctx context.Context, userID, playlistID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx, `DELETE FROM playlists WHERE user_id = $1 AND playlist_id = $2`, userID, playlistID)
	return err
}

func (r *PlaylistRepo) DeleteImportedForUser(ctx context.Context, userID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx, `DELETE FROM playlists WHERE user_id = $1 AND imported = t`, userID)
	return err
}

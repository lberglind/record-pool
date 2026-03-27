package postgres

import (
	"context"
	"fmt"
	"log"
	"record-pool/internal/domain"

	sq "github.com/Masterminds/squirrel"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SearchRepo struct {
	pool *pgxpool.Pool
}

func NewSearchRepo(pool *pgxpool.Pool) *SearchRepo {
	return &SearchRepo{pool: pool}
}

//CREATE TABLE IF NOT EXISTS tracks (
//    hash TEXT UNIQUE PRIMARY KEY NOT NULL,
//    file_format VARCHAR(10) NOT NULL,
//    artist TEXT,
//    title TEXT,
//    album TEXT,
//    album_artist TEXT,
//    duration DECIMAL,
//    size DECIMAL,
//    bitrate DECIMAL,
//    bpm DECIMAL(5,2),
//    genre TEXT,
//    publisher TEXT,
//    release_date DATE,
//    created_at TIMESTAMPTZ DEFAULT NOW()
//);

func (r *SearchRepo) SearchTracks(ctx context.Context, userID uuid.UUID, params domain.SearchParams) ([]domain.SearchResult, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	query := psql.Select(`DISTINCT ON (t.hash) t.hash, t.file_format, t.artist, t.title, t.album, t.album_artist, t.duration, 
		t.size, t.bitrate, t.sample_rate, t.bpm, t.genre, t.publisher, t.release_date, t.created_at, m.tonality`).
		From("tracks t").LeftJoin("track_metadata m ON t.hash = m.track_hash").
		OrderBy("t.hash").
		OrderByClause(sq.Expr("CASE WHEN m.uploaded_by = ? THEN 0 ELSE 1 END ASC", userID))

	// --- String matchers (Unaccented) ---
	stringFilters := []struct {
		val string
		col string
	}{
		{params.Album, "t.album"}, {params.AlbumArtist, "t.album_artist"}, {params.Label, "t.publisher"},
	}
	for _, f := range stringFilters {
		if f.val != "" {
			query = query.Where(fmt.Sprintf("f_unaccent(%s) = f_unaccent(?)", f.col), f.val)
		}
	}

	// --- Numeric/Date Ranges ---
	query = addRangeFilter(query, "t.bpm", params.MinBPM, params.MaxBPM)
	query = addRangeFilter(query, "t.release_date", params.MinRelease, params.MaxRelease)
	query = addRangeFilter(query, "t.bitrate", params.MinBitRate, params.MaxBitRate)
	query = addRangeFilter(query, "t.size", params.MinSize, params.MaxSize)
	query = addRangeFilter(query, "t.duration", params.MinDuration, params.MaxDuration)
	query = addRangeFilter(query, "t.sample_rate", params.MinSampleRate, params.MaxSampleRate)
	query = addRangeFilter(query, "t.created_at", params.MinTimeStamp, params.MaxTimeStamp)

	// --- Specific matchers ---
	if params.Genre != "" {
		query = query.Where("? = ANY(string_to_array(t.genre, ';'))", params.Genre)
	}
	if params.Tonality != "" {
		query = query.Where("m.tonality = ?", params.Tonality)
	}

	// --- Fuzzy/Similarity Filters ---
	if params.Query != "" {
		query = query.Where("(f_unaccent(lower(t.title)) || ' ' || f_unaccent(lower(t.artist))) % f_unaccent(lower(?))", params.Query).
			OrderByClause(sq.Expr("f_unaccent(lower(t.title)) || ' ' || f_unaccent(lower(t.artist)) <-> f_unaccent(lower(?)) ASC", params.Query))

		// --- Offset Pagination ---
		query = query.Offset(getOffset(params.Limit, params.Page))
	} else {

		// --- Cursor Pagination / Browsing---
		if params.LastTimeStamp != nil && params.LastHash != "" {
			query = query.Where(sq.Expr("(t.created_at, t.hash) < (?, ?)", params.LastTimeStamp, params.LastHash))
		}
		query = query.OrderBy("t.created_at DESC")
	}

	query = query.Limit(getLimit(params.Limit))

	sql, args, err := query.ToSql()
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}
	defer rows.Close()

	results := []domain.SearchResult{}
	for rows.Next() {
		var r domain.SearchResult
		err := rows.Scan(
			&r.Hash,
			&r.Format,
			&r.Artist,
			&r.Title,
			&r.Album,
			&r.AlbumArtist,
			&r.Duration,
			&r.Size,
			&r.BitRate,
			&r.SampleRate,
			&r.BPM,
			&r.Genre,
			&r.Label,
			&r.ReleaseDate,
			&r.TimeStamp,
			&r.Tonality,
		)
		if err != nil {
			log.Println(err.Error())
			return nil, err
		}
		results = append(results, r)
	}
	if err := rows.Err(); err != nil {
		log.Println(err.Error())
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}
	return results, nil
}

func addRangeFilter[T any](q sq.SelectBuilder, col string, min, max *T) sq.SelectBuilder {
	if min != nil {
		q = q.Where(fmt.Sprintf("%s >= ?", col), *min)
	}
	if max != nil {
		q = q.Where(fmt.Sprintf("%s <= ?", col), *max)
	}
	return q
}

func getLimit(orgLimit *uint64) uint64 {
	var limit uint64 = 20
	if orgLimit != nil {
		limit = *orgLimit
		if limit < 1 || limit > 200 {
			limit = 20
		}
	}
	return limit
}

func getOffset(limit *uint64, page *uint64) uint64 {
	var offset uint64 = 0
	if page != nil {
		page := *page
		page = max(page, 1)
		offset = (page - 1) * getLimit(limit)
	}
	return offset
}

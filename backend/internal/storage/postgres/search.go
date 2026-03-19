package postgres

import (
	"context"
	"fmt"
	"log"
	"record-pool/internal/domain"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SearchRepo struct {
	pool *pgxpool.Pool
}

func NewSearchRepo(pool *pgxpool.Pool) *SearchRepo {
	return &SearchRepo{pool: pool}
}

func (r *SearchRepo) SearchTracks(ctx context.Context, params domain.SearchParams) ([]domain.Track, error) {
	psql := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)
	query := psql.Select("t.hash, t.file_format, t.title, t.artist, t.created_at").From("tracks t").
		Join("track_metadata m ON t.hash = m.track_hash")

	// --- Fuzzy/Similarity Filters ---
	if params.Title != "" {
		query = query.Where("unaccent(t.title) % unaccent(?)", params.Title).
			OrderByClause(sq.Expr("unaccent(t.title) <-> unaccent(?) ASC", params.Title))
	}
	if params.Artist != "" {
		query = query.Where("unaccent(t.artist) % unaccent(?)", params.Artist).
			OrderByClause(sq.Expr("unaccent(t.artist) <-> unaccent(?) ASC", params.Artist))
	}

	// --- String matchers (Unaccented) ---
	stringFilters := []struct {
		val string
		col string
	}{
		{params.Album, "m.album"}, {params.Comments, "m.comments"},
		{params.Remixer, "m.remixer"}, {params.Label, "m.label"},
		{params.Mix, "m.mix"}, {params.Composer, "m.composer"},
	}
	for _, f := range stringFilters {
		if f.val != "" {
			query = query.Where(fmt.Sprintf("unaccent(%s) = unaccent(?)", f.col), f.val)
		}
	}

	// --- Numeric/Date Ranges ---
	query = addRangeFilter(query, "m.bpm", params.MinBPM, params.MaxBPM)
	query = addRangeFilter(query, "m.year", params.MinYear, params.MaxYear)
	query = addRangeFilter(query, "m.date_added", params.MinDateAdded, params.MaxDateAdded)
	query = addRangeFilter(query, "m.play_count", params.MinPlayCount, params.MaxPlayCount)
	query = addRangeFilter(query, "m.rating", params.MinRating, params.MaxRating)
	query = addRangeFilter(query, "m.bitrate", params.MinBitRate, params.MaxBitRate)
	query = addRangeFilter(query, "m.size", params.MinSize, params.MaxSize)
	query = addRangeFilter(query, "m.duration_seconds", params.MinDuration, params.MaxDuration)
	query = addRangeFilter(query, "m.sample_rate", params.MinSampleRate, params.MaxSampleRate)
	query = addRangeFilter(query, "m.created_at", params.MinTimeStamp, params.MaxTimeStamp)

	// --- Specific matchers ---
	if params.Genre != "" {
		query = query.Where("? = ANY(string_to_array(m.genre, ';'))", params.Genre)
	}
	if params.Tonality != "" {
		query = query.Where("m.tonality = ?", params.Tonality)
	}

	// --- Pagination ---
	var limit uint64 = 20
	var offset uint64 = 0

	if params.PageSize != nil {
		limit = *params.PageSize
		if limit < 1 || limit > 200 {
			limit = 20
		}
	}
	if params.Page != nil {
		page := *params.Page
		page = max(page, 1)
		offset = (page - 1) * limit
	}
	query = query.Limit(limit).Offset(offset)

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

	tracks := []domain.Track{}
	for rows.Next() {
		var t domain.Track
		err := rows.Scan(
			&t.Hash,
			&t.Format,
			&t.Title,
			&t.Artist,
			&t.CreatedAt)
		if err != nil {
			log.Println(err.Error())
			continue
		}
		tracks = append(tracks, t)
	}
	if err := rows.Err(); err != nil {
		log.Println(err.Error())
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}
	return tracks, nil
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

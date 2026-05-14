package track

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"os/exec"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/dhowden/tag"
	"golang.org/x/sync/errgroup"
	"gopkg.in/vansante/go-ffprobe.v2"
)

type Metadata struct {
	Hash     string
	Title    string
	Artist   string
	FileType string
	Cover    []byte
	MimeType string
}

func ExtractMetadata(file multipart.File) (Metadata, error) {
	// 1. Hash the file
	hash, err := tag.Sum(file)
	if err != nil {
		return Metadata{}, fmt.Errorf("Failed to create audio checksum")
	}

	// 2. Reset file pointer and get Tags
	_, err = file.Seek(0, 0)
	if err != nil {
		return Metadata{}, fmt.Errorf("Failed to reset file pointer")
	}

	m, err := tag.ReadFrom(file)
	if err != nil {
		return Metadata{}, fmt.Errorf("Failed to read tags from file")
	}
	title := m.Title()
	artist := m.Artist()
	fileType := strings.ToLower(string(m.FileType()))
	p := m.Picture()

	// 3. Reset file pointer and get duration
	_, err = file.Seek(0, 0)
	if err != nil {
		return Metadata{}, fmt.Errorf("Failed to reset file pointer")
	}

	return Metadata{
		Hash:     hash,
		Title:    title,
		Artist:   artist,
		FileType: fileType,
		Cover:    p.Data,
		MimeType: p.MIMEType,
	}, nil
}

type ExecMetadata struct {
	Hash        string
	FileType    string
	Artist      string
	Title       string
	Album       string
	AlbumArtist string
	Duration    float64
	Size        int
	BitRate     int
	SampleRate  int
	Bpm         float64
	Genre       string
	Publisher   string
	ReleaseDate time.Time
	Cover       []byte
	MimeType    string
}

type ffprobeResult struct {
	FileType    string
	Artist      string
	Title       string
	Album       string
	AlbumArtist string
	Duration    float64
	Size        int
	BitRate     int
	SampleRate  int
	Genre       string
	Publisher   string
	ReleaseDate time.Time
}

func ExecExtractMetadata(ctx context.Context, file multipart.File, header *multipart.FileHeader) (ExecMetadata, error) {
	// 1. Get extension from file header
	ext := path.Ext(header.Filename)
	if ext == "" {
		ext = ".tmp"
	}

	// 2. Create Temp File with the correct extension
	tempFile, err := os.CreateTemp("", "track-*"+ext)
	if err != nil {
		return ExecMetadata{}, fmt.Errorf("Failed to create tempFile: %w", err)
	}
	defer os.Remove(tempFile.Name())
	defer tempFile.Close()

	if _, err := io.Copy(tempFile, file); err != nil {
		log.Printf("io.Copy: %v\n", err.Error())
		return ExecMetadata{}, err
	}
	_, err = tempFile.Seek(0, 0)
	if err != nil {
		log.Printf("file.seek: %v\n", err.Error())
		return ExecMetadata{}, err
	}

	// 3. Set up for go routines
	filePath := tempFile.Name()

	g, gCtx := errgroup.WithContext(ctx)

	// 4. Execute go routines
	var cover []byte
	var mimeType string
	g.Go(func() error {
		m, err := tag.ReadFrom(tempFile)
		if err != nil {
			log.Printf("tag.ReadFrom(tempfile): %v\n", err.Error())
			return nil
		}
		if pic := m.Picture(); pic != nil {
			cover = pic.Data
			mimeType = pic.MIMEType

		}
		return nil
	})

	var meta ffprobeResult
	g.Go(func() error {
		meta, err = getffprobe(gCtx, filePath)
		if err != nil {
			log.Printf("ffprobe: %v\n", err.Error())
		}
		return nil
	})

	var bpm float64
	g.Go(func() error {
		bpm, err = getAubioBpm(gCtx, filePath)
		if err != nil {
			log.Printf("aubio: %v\n", err.Error())
		}
		return err
	})

	var hash string
	g.Go(func() error {
		hash, err = getffmpegHash(gCtx, filePath)
		if err != nil {
			log.Printf("ffmpeg: %v\n", err.Error())
		}
		return nil
	})

	if err := g.Wait(); err != nil {
		return ExecMetadata{}, fmt.Errorf("Metadata Extraction failed: %w", err)
	}

	return ExecMetadata{
		Hash:        hash,
		FileType:    meta.FileType,
		Artist:      meta.Artist,
		Title:       meta.Title,
		Album:       meta.Album,
		AlbumArtist: meta.AlbumArtist,
		Duration:    meta.Duration,
		Size:        meta.Size,
		BitRate:     meta.BitRate,
		SampleRate:  meta.SampleRate,
		Bpm:         bpm,
		Genre:       meta.Genre,
		Publisher:   meta.Publisher,
		ReleaseDate: meta.ReleaseDate,
		Cover:       cover,
		MimeType:    mimeType,
	}, nil
}

func getAubioBpm(ctx context.Context, file string) (float64, error) {
	cmd := exec.CommandContext(ctx, "aubio", "tempo", file)
	out, err := cmd.Output()
	if err == nil {
		fields := strings.Fields(string(out))
		if len(fields) == 0 {
			return 0, fmt.Errorf("aubio returned empty output")
		}
		bpm, err := strconv.ParseFloat(fields[0], 64)
		return bpm, err
	}
	return 0, err
}

func getffprobe(ctx context.Context, file string) (ffprobeResult, error) {
	var r ffprobeResult
	data, err := ffprobe.ProbeURL(ctx, file)
	if err != nil {
		return r, err
	}

	for _, stream := range data.Streams {
		if stream.CodecType == "audio" {
			r.SampleRate, _ = strconv.Atoi(stream.SampleRate)
			break
		}
	}

	if data.Format != nil {
		r.FileType = data.Format.FormatName
		r.Duration = data.Format.DurationSeconds
		r.Size, _ = strconv.Atoi(data.Format.Size)
		r.BitRate, _ = strconv.Atoi(data.Format.BitRate)
	}

	if data.Format != nil && data.Format.TagList != nil {
		tags := data.Format.TagList
		r.Artist = getTagValue(tags, "artist")
		r.Title = getTagValue(tags, "title")
		r.Album = getTagValue(tags, "album")
		r.AlbumArtist = getTagValue(tags, "album_artist")
		r.Genre = getTagValue(tags, "genre")
		r.Publisher = getTagValue(tags, "publisher")
		r.ReleaseDate, _ = time.Parse("2006-01-02", getTagValue(tags, "date"))
	}
	return r, nil
}

func getffmpegHash(ctx context.Context, file string) (string, error) {
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-v", "error",
		"-hide_banner",
		"-i", file,
		"-map_metadata", "-1",
		"-vn",
		"-f", "hash",
		"-hash", "sha256",
		"-")

	out, err := cmd.Output()
	if err != nil {
		return "", err
	}

	hashStr := strings.TrimSpace(string(out))
	hash := strings.TrimPrefix(hashStr, "SHA256=")
	return hash, nil
}

func getTagValue(t ffprobe.Tags, key string) string {
	if t == nil {
		return ""
	}
	val, ok := t[strings.ToLower(key)]
	if !ok {
		return ""
	}
	return fmt.Sprintf("%v", val)
}

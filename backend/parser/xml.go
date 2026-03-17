package parser

import (
	"encoding/xml"
	"fmt"
	"io"
)

type RekordBox struct {
	XMLName    xml.Name   `xml:"DJ_PLAYLISTS"`
	Collection Collection `xml:"COLLECTION"`
	Playlists  []Node     `xml:"PLAYLISTS>NODE"`
}

type Collection struct {
	Entries int     `xml:"Entries,attr"`
	Tracks  []Track `xml:"TRACK"`
}

type Track struct {
	Id         int        `xml:"TrackID,attr"`
	Name       string     `xml:"Name,attr"`
	Artist     string     `xml:"Artist,attr"`
	Album      string     `xml:"Album,attr"`
	Genre      string     `xml:"Genre,attr"`
	Size       int        `xml:"Size,attr"`
	Duration   int        `xml:"TotalTime,attr"`
	Year       int        `xml:"Year,attr"`
	Composer   string     `xml:"Composer,attr"`
	BPM        float64    `xml:"AverageBpm,attr"`
	DateAdded  string     `xml:"DateAdded,attr"`
	BitRate    int        `xml:"BitRate,attr"`
	SampleRate int        `xml:"SampleRate,attr"`
	Comments   string     `xml:"Comments,attr"`
	Playcount  int        `xml:"PlayCount,attr"`
	Rating     int        `xml:"Rating,attr"`
	Location   string     `xml:"Location,attr"`
	Remixer    string     `xml:"Remixer,attr"`
	Tonality   string     `xml:"Tonality,attr"`
	Label      string     `xml:"Label,attr"`
	Mix        string     `xml:"Mix,attr"`
	Tempos     []Tempo    `xml:"TEMPO"`
	CuePoints  []CuePoint `xml:"POSITION_MARK"`
}

type Tempo struct {
	Inizio  float64 `xml:"Inizio,attr"`
	BPM     float64 `xml:"Bpm,attr"`
	Metro   string  `xml:"Metro,attr"`
	Battito int     `xml:"Battito,attr"`
}

type CuePoint struct {
	Name  string  `xml:"Name,attr"`
	Type  int     `xml:"Type,attr"`
	Start float64 `xml:"Start,attr"`
	Num   int     `xml:"Num,attr"`
	Red   *int    `xml:"Red,attr,omitempty"`
	Green *int    `xml:"Green,attr,omitempty"`
	Blue  *int    `xml:"Blue,attr,omitempty"`
}

type Node struct {
	Name string `xml:"Name,attr"`
	Type int    `xml:"Type,attr"`
	// For root
	Count int `xml:"Count,attr"`

	// For Playlists
	KeyType int        `xml:"KeyType,attr"`
	Entries int        `xml:"Entries,attr"`
	Nodes   []Node     `xml:"NODE"`
	Tracks  []TrackKey `xml:"TRACK"`
}

type TrackKey struct {
	Key int `xml:"Key,attr"`
}

func Parse(r io.Reader) (*RekordBox, error) {
	var rb RekordBox
	if err := xml.NewDecoder(r).Decode(&rb); err != nil {
		return nil, fmt.Errorf("failed to parse rekordbox XML: %w", err)
	}
	return &rb, nil
}

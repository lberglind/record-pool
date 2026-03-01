package rbxml

import (
	"encoding/xml"
)

type RekordBox struct {
	XMLName    xml.Name   `xml:"DJ_PLAYLISTS"`
	Collection Collection `xml:"COLLECTION"`
	Playlists  Playlists  `xml:"PLAYLISTS"`
}

type Collection struct {
	Entries int     `xml:"Entries,attr"`
	Tracks  []Track `xml:"TRACK"`
}

type Track struct {
	Id        int        `xml:"TrackID,attr"`
	Name      string     `xml:"Name,attr"`
	Artist    string     `xml:"Artist,attr"`
	Genre     string     `xml:"Genre,attr"`
	BPM       float64    `xml:"AverageBpm,attr"`
	BitRate   int        `xml:"BitRate,attr"`
	Tonality  string     `xml:"Tonality,attr"`
	Tempos    []Tempo    `xml:"TEMPO"`
	CuePoints []CuePoint `xml:"POSITION_MARK"`
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

type Playlists struct {
	Nodes []Node `xml:"NODE"`
}

type Node struct {
	Name    string     `xml:"Name,attr"`
	Type    int        `xml:"Type,attr"`
	KeyType int        `xml:"KeyType,attr"`
	Entries int        `xml:"Entries,attr"`
	Nodes   []Node     `xml:"NODE"`
	Tracks  []TrackKey `xml:"TRACK"`
}

type TrackKey struct {
	Key int `xml:"Key,attr"`
}

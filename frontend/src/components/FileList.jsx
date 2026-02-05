import { useState, useEffect } from 'react';
import { fileService } from '../services/api';

export function FileList() {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fileService.fetchFiles()
            .then(data => {
                setTracks(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <p>Loading tracks...</p>;

    return (
        <div>
            <h2>Record Pool Tracks</h2>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Arist</th>
                        <th>Duration</th>
                        <th>Format</th>
                        <th>Time Stamp</th>
                    </tr>
                </thead>
                <tbody>
                    {tracks.map(track => (
                        <tr key={track.hash}>
                            <td>{track.title}</td>
                            <td>{track.artist}</td>
                            <td>{track.duration.toFixed(2)}</td>
                            <td>{track.format}</td>
                            <td>{track.timeStamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
}

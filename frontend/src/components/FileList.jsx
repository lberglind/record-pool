import { useState, useEffect } from 'react';
import { fileService } from '../services/api';

export function FileList() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fileService.fetchFiles()
            .then(data => {
                setFiles(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <p>Loading tracks...</p>;

    return (
        <div>
            <h2>Record Pool Tracks</h2>
            <ul>
                {files.map(filename => (
                    <li key={filename}>{filename}</li>
                ))}
            </ul>
        </div>
    );
}

import React, { useState } from 'react';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | uploading | success | error
    const [response, setResponse] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus('idle');
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');

        const formData = new FormData();
        formData.append('file', file); // 'file' must match r.FormFile("file") in Go

        try {
            const res = await fetch('http://localhost:8080/upload', {
                method: 'POST',
                body: formData,
                // Note: Do NOT set Content-Type header manually. 
                // The browser will automatically set it to multipart/form-data with the correct boundary.
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json(); // Assuming your Go server returns JSON
            setResponse(data);
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Upload Track</h3>

            <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={status === 'uploading'}
            />

            <button
                onClick={handleUpload}
                disabled={!file || status === 'uploading'}
                style={{ marginLeft: '10px' }}
            >
                {status === 'uploading' ? 'Uploading...' : 'Upload'}
            </button>

            <div style={{ marginTop: '15px' }}>
                {status === 'success' && (
                    <p style={{ color: 'green' }}>✓ Success! Hash: {response?.hash}</p>
                )}
                {status === 'error' && (
                    <p style={{ color: 'red' }}>✗ Error uploading file.</p>
                )}
            </div>
        </div>
    );
};

export default FileUpload;

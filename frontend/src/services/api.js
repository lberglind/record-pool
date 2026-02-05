const API_BASE = "http://localhost:8080"

export const fileService = {
    async fetchFiles() {
        const response = await fetch(`${API_BASE}/files`);
        if (!response.ok) throw new Error("Failed to fetch files");
        return response.json();
    },

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file)

        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");
        return response.json();
    },

    downloadFile(hash) {
        const url = `${API_BASE}/download?file=${encodeURIComponent(hash)}`;

        const link = document.createElement('a')
        link.href = url;
        document.body.appendChild(link);
        link.click()
        link.remove()
    },
}



const API_BASE = "http://localhost:8080"

export const fileService = {
    async fetchFiles() {
        const response = await fetch(`${API_BASE}/files`);
        if (!response.ok) throw new Error("Failed to fetch files");
        return response.json();
    }
}

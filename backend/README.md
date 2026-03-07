# Record Pool API

This is the backend API for the Record Pool, powered by Go, PostgreSQL, and MinIO.

## API Endpoints

All endpoints are relative to your backend base URl (e.g. `localhost:8080`)

### **Tracks**

#### **1. List All Tracks**
Returns a JSON array of all tracks currently indexed in the database.
- **URL** `api/tracks`
- **Method** `GET`
- **Success Response** `200 OK`
- **Content Type** `application/json`
- **Sample Body:**
```json
  [
    {
      "hash": "a1b2c3d4...",
      "format": "mp3",
      "title": "California Gurls",
      "artist": "Katy Perry/Snoop Dogg",
      "duration": 234,
      "timeStamp": "2026-03-07T00:00:00Z"
    }
  ]
```

#### **2. Upload Track**
Uploads a file, extracts ID3 tags (Title/Artist), generates a SHA-256 hash, and stores it in both Postgres and MinIO.
- **URL** `api/upload`
- **Method** `POST`
- **Success Response** `201 Created`
- **Content Type** `multipart/form-data`
- **Body** `file`: The audio file binary
- **Logic** 
  - Files are stored in MinIO using the path: tracks/<hash>.<format>.
  - Database entries are deduplicated via the unique file hash.

#### **3. Download Track**
Proxies the audio stream from MinIO to the client. This ensures the storage layer (MinIO) remains isolated from the public internet.
- **URL:** `/api/download`
- **Method:** `GET`
- **Success Response** `200 OK`
- **Query Params:** - `file=[hash]` (The SHA-256 hash)
- **Technical Flow:**
  1. Go fetches the file stream from MinIO.
  2. Go retrieves the original `title` and `format` from Postgres.
  3. Go streams the data to the user via `io.Copy`, preventing high memory usage.
- **Behaviors:**
  - Sets `Content-Disposition` to `attachment; filename="Title.format"`.
- **Errors**
  - `400 Bad Request`: Missing file hash.
  - `404 Not Found`: Hash not found in Database or MinIO.

### Authentication & Users

#### **1. Add User / Sync**
Creates a new user or updates an existing one based on email (Slack OAuth integration point).
- **URL:** `/api/download`
- **Method:** `GET`
- **Success Response** `200 OK`
- **Technical Flow:**
  - Internal function: `AddUser(email, name)`
  - Performs an UPSERT on the email. Automatically triggers CreateSession
- **Response** Returns a `session_id``

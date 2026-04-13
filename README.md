# Project Repo 

## Short Description of Project

This is a private record pool designed for DJs where users can upload and browse music. The frontend is built in next.js with a selfhosted backend written in go that connects to a selfhosted postgres database and selfhosted s3 storage via minio.

A user is authenticated via a slack OAuth token from the connected workspace which can be joined through this link: `https://join.slack.com/t/recordpooltest/shared_invite/zt-3v23ckmxx-BfllkTW7q1Tyd17cows9rg`

To enter website use: `https://pool.berglind.io/`

Enhanced Tracking Protection may need to be disabled to allow the third-party session cookie needed for authentication.


## What You Have Done
* Created various presenters and their accompanying views to allow basic functionality. 
* Routing done through the navbar-presenter and in the /app directory.
* Tracks can be uploaded and browsed through searching for a combination of title and artist. 
* DJs can upload their track and playlist metadata by importing their RekordBox XML data. 

## What You Still Plan To Do
* The pages and search bar in the navbar are not yet implemented. Downloading of tracks is not yet implemented.
* Like functionality to like songs. 

## Your Project File Structure

## 1. Routing & Layout (/app)
- **layout.tsx** – The main layout. Contains the navigation bar, theme switcher, and global fonts.
- **page.tsx** – The home page. Connects the search and login parts together.
- **globals.css** – Global styles and Tailwind CSS settings.
- **login/callback/page.tsx** – Handles OAuth redirect and login flow.

## 2. Data & State + Model Layer (/api, /models, /stores)
- **trackSource.ts** – Handles API calls for searching, uploading, and getting tracks
- **userSource.ts** – Handles user API calls and login checks
- **useTrackStore.ts** – A Zustand store that manages tracks, search results, and uploads
- **useUserStore.ts** – A Zustand store for user sessions and login status
- **types.ts** – Central TypeScript definitions (like Track interfaces)

## 3. Presenter Layer (/presenters)
- **search-presenter.tsx** – Handles search logic and track previews
- **login-presenter.tsx** – Handles user login logic and what to show based on login status
- **navbar-presenter.tsx** – Handles navigation state and the search box in the header

## 4. View Layer and External Components (/views & /components)
- **/views** – Simple components that define how a feature looks (e.g., search-view, tracks-table-view)
- **/components/ui** – Small building blocks like buttons, inputs, dialogs, and tables (from shadcn/ui)
- **theme-provider.tsx** – Handles Dark/Light mode switching

## 5. Utils
- **utils.ts** – Helper functions for formatting (time, dates) and merging CSS classes (cn)

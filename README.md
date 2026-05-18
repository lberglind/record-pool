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

## User-evaluation

## Prototyping-stage
The user was shown a prototype on paper together with a simple prototype web-page and noted the following: 
- The structure was clear at this point
- The navbar at the top allowed for easy navigation and the different pages: "Crate Pool", "Library", "Liked" and "Profile" seemed to all be relevant.
- The search bar had most of the correct functionality but that it could be good to add some sort of filters to adjust what was shown when searching. For example only showing songs over or under a specified BPM or selecting genres.
- The profile page looks good.
- The liked page looks good.
- The library page looks good (could be called "playlists", but that's a personal preference).
- All icons look really good together with the overall UI that looks clean and professional.

We decided to add the filter function for searching and also decided to stick with "library" instead of "playlists" as this would allow for further categories inside of library in the future, not just playlists. 

## Formative evaluation-stage
The user was now shown a close to finished web-page and noted the following:

- The UI was overall really clean and professional (especially liked the highlighting of buttons when pressed, e.g the different pages).
- Though that the filter funciton fit well and enhanced the experience.
- Everything is responsive and works as expected.
- The page can be contracted and expanded and it still works like expected.
- It would be good to add a like button besides the eye-icon on the start page. This would allow the user to see which songs they had liked directly in the table instead of having to go into the track-preview-view.
- Does not like that the log in button is part of the page in the corner, making it unclear if you have to be logged-in to get access to the application-functionality.

  
We decided to add the ability for the user to see if the track was liked or not in the table, we also added the ability to actually like the track directly from the table. We also decided to create a smoother and clearer log-in experience by clearly stating that the user should log in to continue, we also put it in the middle of the page to impove the look. 





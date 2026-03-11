import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="flex items-center justify-between p-4 border-b">
            <div className="font-bold text-lg">
                <Link href="/">Record Pool</Link>
            </div>

            <div className="flex gap-4">
                <Link href="/tracks">Tracks</Link>
                <Link href="/upload">Upload</Link>
                <Link href="/playlists">Playlists</Link>
                <Link href="/profile">Profile</Link>
            </div>
        </nav>
    );
}

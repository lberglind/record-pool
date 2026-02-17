import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="flex items-center justify-between p-4 border-b">
            <div className="font-bold text-lg">
                Record Pool
            </div>

            <div className="flex gap-4">
                <Link href="/">Tracks</Link>
                <Link href="/upload">Upload</Link>
            </div>
        </nav>
    );
}

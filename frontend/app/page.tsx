"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/api";
import LoginPage from "./login/page";
import { Tracks } from "./tracks/page";

export default function Home() {
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if a session cookie exists and fetch current user
        getCurrentUser()
            .then((data) => setUser(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading…</div>;

    return <div>{user ? <Tracks /> : <LoginPage />}</div>;
}

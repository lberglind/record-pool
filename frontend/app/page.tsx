"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/api";
import LoginPage from "./login/page";
import { redirect } from "next/navigation";

export default function Home() {
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then((data) => setUser(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading…</div>;
    if (user) redirect("/tracks");
    return <LoginPage />;
}

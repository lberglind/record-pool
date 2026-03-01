"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // The cookie is already set by the browser from the backend redirect
        // Just send the user home where Home component will fetch the user
        router.push("/");
    }, [router]);

    return <div>Completing login...</div>;
}

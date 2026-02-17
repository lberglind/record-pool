"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin() {
        const options = {
            method: "POST",
            credentails: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        }
        const res = await fetch(`${API_URL}/login`, options);
        if (!res.ok) {
            alert("Login failed");
            return;
        }

        window.location.href = "/";
    }

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-xl font-bold">Login</h1>
            <input
                className="border p-2 w-full"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                className="border p-2 w-full"
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                onClick={handleLogin}
                className="bg-black text-white p-2 w-full"
            >
                Login
            </button>
        </div>
    );
}

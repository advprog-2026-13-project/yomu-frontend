"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ identifier: username, password }),
        });

        const data = await res.json();

        if (res.ok) {

            const token = data.token ?? data.accessToken ?? data.jwt;

            if (!token) {
                alert("Login success but token not found in response");
                return;
            }

            localStorage.setItem("token", token);
            router.push("/dashboard");

        } else {
            alert("Login failed");
        }
    }

    return (
        <div style={{ padding: "40px" }}>
            <h1>Login</h1>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px", width: "250px" }}>
                <input
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Login</button>
            </form>
        </div>
    );
}
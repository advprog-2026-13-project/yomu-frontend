"use client";

import { useState } from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const text = await res.text();
        console.log("REGISTER STATUS:", res.status);
        console.log("REGISTER BODY:", text);

        if (res.ok) {
            setMessage("Register success! Please login.");
        } else {
            setMessage(`Register failed (${res.status}): ${text}`);
        }
    }

    return (
        <div style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>Register</h1>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px", width: "250px" }}>
                <input
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Register</button>
            </form>

            <p>{message}</p>

            <a href="/auth/login">Go to Login</a>
        </div>
    );
}
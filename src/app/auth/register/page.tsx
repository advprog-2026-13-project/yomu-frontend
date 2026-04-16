"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState(""); 
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState(""); 
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                username, 
                displayName, 
                email: email || null, 
                phoneNumber: phoneNumber || null, 
                password 
            }),
        });

        const data = await res.json().catch(() => ({}));
        
        if (res.ok) {
            setMessage("Register success! Please login.");
            setTimeout(() => router.push("/auth/login"), 1500);
        } else {
            setMessage(`Register failed (${res.status}): ${data.message || "Unknown error"}`);
        }
    }

    return (
        <div style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>Register</h1>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px", width: "250px" }}>
                <input
                    placeholder="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    placeholder="display name"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />

                <input
                    placeholder="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    placeholder="phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Register</button>
            </form>

            <p style={{ color: message.includes("success") ? "green" : "red" }}>{message}</p>

            <a href="/auth/login">Go to Login</a>
        </div>
    );
}
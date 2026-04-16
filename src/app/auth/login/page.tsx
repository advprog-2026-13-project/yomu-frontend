"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google"; 

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // handle Google SSO
    const handleGoogleSuccess = async (credentialResponse: any) => {
        const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: credentialResponse.credential }),
        });

        const data = await res.json();

        if (res.ok) {
            const token = data.accessToken ?? data.token ?? data.jwt;
            
            if (token) {
                localStorage.setItem("token", token);
                router.push("/dashboard");
            } else {
                alert("Token not found in response");
            }
        } else {
            alert(`Google Login Failed: ${data.message || "Unknown error"}`);
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: username, password }),
        });

        const data = await res.json();

        if (res.ok) {
            const token = data.token ?? data.accessToken ?? data.jwt;
            if (!token) {
                alert("Login success but token not found");
                return;
            }
            localStorage.setItem("token", token);
            router.push("/dashboard");
        } else {
            alert("Login failed: Invalid credentials");
        }
    }

    return (
        <div style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>Login Yomu</h1>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px", width: "250px" }}>
                <input
                    placeholder="username or email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>Login</button>
            </form>

            {/* Separator */}
            <div style={{ margin: "20px 0", width: "250px", textAlign: "center", borderBottom: "1px solid #ccc", lineHeight: "0.1em" }}>
                <span style={{ background: "#fff", padding: "0 10px", color: "#888" }}>atau</span>
            </div>

            {/* Tombol Google */}
            <div style={{ width: "250px" }}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => alert("Google Login Failed")}
                    useOneTap
                />
            </div>

            <p style={{ marginTop: "20px" }}>
                Belum punya akun? <a href="/auth/register">Daftar di sini</a>
            </p>
        </div>
    );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google"; 

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState(""); 
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState(""); 
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    // Handle Google SSO 
    const handleGoogleSuccess = async (credentialResponse: any) => {
        const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: credentialResponse.credential }),
        });

        const data = await res.json();

        if (res.ok) {
            const token = data.accessToken ?? data.token;
            
            if (token) {
                localStorage.setItem("token", token);
                router.push("/dashboard");
            } else {
                setMessage("Google Registration Success but token missing");
            }
        } else {
            setMessage("Google Registration Failed");
        }
    };

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
            <h1>Register Yomu</h1>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px", width: "250px" }}>
                <input placeholder="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
                <input placeholder="display name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                <input placeholder="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input placeholder="phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                <input type="password" placeholder="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>Daftar Manual</button>
            </form>

            <div style={{ margin: "20px 0", width: "250px", textAlign: "center", borderBottom: "1px solid #ccc", lineHeight: "0.1em" }}>
                <span style={{ background: "#fff", padding: "0 10px", color: "#888" }}>atau</span>
            </div>

            <div style={{ width: "250px" }}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setMessage("Google Auth Failed")}
                    text="signup_with" 
                />
            </div>

            <p style={{ color: message.includes("success") ? "green" : "red" }}>{message}</p>
            <a href="/auth/login">Sudah punya akun? Login</a>
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";

type User = {
    id?: string;
    username: string;
    role: string;
};

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
    };

    useEffect(() => {
        async function fetchUser() {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("No token found. Please login.");
                return;
            }

            try {
                const res = await fetch("/api/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Unauthorized");
                }

                const data = await res.json();
                setUser(data);

            } catch (err) {
                setError("Failed to fetch user");
            }
        }

        fetchUser();
    }, []);

    return (
        <div style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>Dashboard</h1>

            {error && <p>{error}</p>}

            {user ? (
                <>
                    <pre>{JSON.stringify(user, null, 2)}</pre>

                    <button
                        onClick={handleLogout}
                        style={{
                            marginTop: "20px",
                            padding: "10px 16px",
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                        }}
                    >
                        Logout
                    </button>
                </>
            ) : (
                !error && <p>Loading user...</p>
            )}
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
    id?: string;
    username: string;
    displayName: string;
    email?: string;
    phoneNumber?: string;
    role: string;
};

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // State untuk Form Update
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        username: "",
        displayName: "",
        email: "",
        phoneNumber: ""
    });

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/auth/login");
    };

    // Fetch User (GET)
    async function fetchUser() {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        try {
            const res = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Unauthorized");

            const data = await res.json();
            setUser(data);
            setEditData({
                username: data.username,
                displayName: data.displayName,
                email: data.email || "",
                phoneNumber: data.phoneNumber || ""
            });
        } catch (err) {
            setError("Failed to fetch user");
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    // Update Akun (PATCH)
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        
        const res = await fetch("/api/auth/me", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(editData)
        });

        if (res.ok) {
            alert("Update profil berhasil!");
            setIsEditing(false);
            fetchUser(); 
        } else {
            alert("Gagal update profil.");
        }
    };

    // Hapus Akun (DELETE)
    const handleDelete = async () => {
        if (!confirm("Peringatan: Akun kamu akan dihapus permanen. Lanjutkan?")) return;

        const token = localStorage.getItem("token");
        const res = await fetch("/api/auth/me", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            localStorage.removeItem("token");
            alert("Akun berhasil dihapus.");
            router.push("/auth/register");
        } else {
            alert("Gagal menghapus akun.");
        }
    };

    return (
        <div style={{ padding: "40px", fontFamily: "Arial", maxWidth: "600px" }}>
            <h1>Dashboard Yomu</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {user ? (
                <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
                    {!isEditing ? (
                        <>
                            <h3>Informasi Akun</h3>
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>Display Name:</strong> {user.displayName}</p>
                            <p><strong>Email:</strong> {user.email || "-"}</p>
                            <p><strong>Phone:</strong> {user.phoneNumber || "-"}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            
                            <button onClick={() => setIsEditing(true)}>Edit Profil</button>
                        </>
                    ) : (
                        <form onSubmit={handleUpdate} style={{ display: "grid", gap: "10px" }}>
                            <h3>Edit Profil</h3>
                            <input 
                                placeholder="Username" 
                                value={editData.username} 
                                onChange={e => setEditData({...editData, username: e.target.value})} 
                            />
                            <input 
                                placeholder="Display Name" 
                                value={editData.displayName} 
                                onChange={e => setEditData({...editData, displayName: e.target.value})} 
                            />
                            <input 
                                placeholder="Email" 
                                value={editData.email} 
                                onChange={e => setEditData({...editData, email: e.target.value})} 
                            />
                            <input 
                                placeholder="Phone Number" 
                                value={editData.phoneNumber} 
                                onChange={e => setEditData({...editData, phoneNumber: e.target.value})} 
                            />
                            <div>
                                <button type="submit">Save</button>
                                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </form>
                    )}

                    <hr style={{ margin: "20px 0" }} />
                    
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={handleLogout}>Logout</button>
                        <button onClick={handleDelete} style={{ background: "#ef4444", color: "white" }}>
                            Hapus Akun
                        </button>
                    </div>
                </div>
            ) : (
                !error && <p>Loading user...</p>
            )}
        </div>
    );
}
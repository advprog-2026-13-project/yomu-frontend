"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/src/modules/auth";

export default function ProfilePage() {
    const { user, loading, error, deleteUser, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        username: "",
        displayName: "",
        email: "",
        phoneNumber: "",
    });

    const startEditing = () => {
        if (user) {
            setEditData({
                username: user.username,
                displayName: user.displayName,
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
            });
        }
        setIsEditing(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateUser(editData);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!confirm("Peringatan: Akun kamu akan dihapus permanen. Lanjutkan?")) return;
        await deleteUser();
    };

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-4">
            <Card className="w-full max-w-lg yomu-card">
                <CardHeader>
                    <CardTitle className="font-serif text-blue-950">Profil Saya</CardTitle>
                    <CardDescription>Kelola informasi akun kamu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {loading && !user && (
                        <p className="text-center text-muted-foreground">Loading user...</p>
                    )}

                    {user && !isEditing && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="font-medium">Username:</span>
                                <span>{user.username}</span>
                                <span className="font-medium">Display Name:</span>
                                <span>{user.displayName}</span>
                                <span className="font-medium">Email:</span>
                                <span>{user.email || "-"}</span>
                                <span className="font-medium">Phone:</span>
                                <span>{user.phoneNumber || "-"}</span>
                                <span className="font-medium text-amber-600">Role:</span>
                                <span className="text-amber-600 font-semibold">{user.role}</span>
                            </div>
                            <Button onClick={startEditing} className="yomu-btn-primary mt-4">Edit Profil</Button>
                        </div>
                    )}

                    {user && isEditing && (
                        <form onSubmit={handleUpdate} className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="edit-username">Username</Label>
                                <Input
                                    id="edit-username"
                                    value={editData.username}
                                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-displayName">Display Name</Label>
                                <Input
                                    id="edit-displayName"
                                    value={editData.displayName}
                                    onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                                <Input
                                    id="edit-phoneNumber"
                                    value={editData.phoneNumber}
                                    onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading} className="yomu-btn-primary">
                                    {loading ? "Menyimpan..." : "Simpan"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                    Batal
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-4">
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        Hapus Akun Permanen
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

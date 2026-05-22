"use client";

import { useState } from "react";
import { Shield, ShieldOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AdminUser } from "@/src/modules/admin/types";
import { fetchUsers, promoteUser, demoteUser } from "@/src/modules/admin/api";

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        setMessage(null);
        setIsError(false);
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (err) {
            setIsError(true);
            setMessage(err instanceof Error ? err.message : "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    if (!initialized) {
        setInitialized(true);
        loadUsers();
    }

    const handleAction = async (id: string, action: "promote" | "demote") => {
        setActionLoading(id);
        setMessage(null);
        setIsError(false);

        try {
            if (action === "promote") {
                await promoteUser(id);
                setMessage("User promoted to ADMIN");
            } else {
                await demoteUser(id);
                setMessage("User demoted to USER");
            }
            await loadUsers();
        } catch (err) {
            setIsError(true);
            setMessage(err instanceof Error ? err.message : `Failed to ${action} user`);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-muted-foreground">Manage user roles</p>
                </div>
                <Button variant="outline" onClick={loadUsers} disabled={loading}>
                    <RefreshCw className="size-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {message && (
                <Alert variant={isError ? "destructive" : "default"}>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <p className="text-muted-foreground">Loading users...</p>}

                    {!loading && users.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No users found</p>
                    )}

                    {!loading && users.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Username</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Display Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-border last:border-0">
                                            <td className="py-3 px-4 font-medium">{user.username}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{user.displayName}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    user.role === "ADMIN"
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-muted text-muted-foreground"
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {user.role !== "ADMIN" && (
                                                        <Button
                                                            size="sm"
                                                            disabled={actionLoading === user.id}
                                                            onClick={() => handleAction(user.id, "promote")}
                                                        >
                                                            <Shield className="size-3 mr-1" />
                                                            {actionLoading === user.id ? "..." : "Promote"}
                                                        </Button>
                                                    )}
                                                    {user.role !== "USER" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={actionLoading === user.id}
                                                            onClick={() => handleAction(user.id, "demote")}
                                                        >
                                                            <ShieldOff className="size-3 mr-1" />
                                                            {actionLoading === user.id ? "..." : "Demote"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

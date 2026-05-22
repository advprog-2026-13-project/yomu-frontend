"use client";

import { useState } from "react";
import { Plus, Shield, Swords, UserPlus, UserMinus, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { Clan, JoinRequest } from "@/src/modules/social/types";
import {
    createClan, getMyClan, leaveClan, deleteClan, getClanById,
    requestToJoinClan, getClanJoinRequests, approveJoinRequest, rejectJoinRequest,
} from "@/src/modules/social/api";

const tierColors: Record<string, string> = {
    BRONZE: "#CD7F32",
    SILVER: "#C0C0C0",
    GOLD: "#FFD700",
    DIAMOND: "#B9F2FF",
};

export default function ClanPage() {
    const [myClan, setMyClan] = useState<Clan | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [hasCheckedClan, setHasCheckedClan] = useState(false);

    const [clanName, setClanName] = useState("");
    const [searchId, setSearchId] = useState("");
    const [searchedClan, setSearchedClan] = useState<Clan | null>(null);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [showRequests, setShowRequests] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const checkMyClan = async () => {
        setLoading(true);
        try {
            const clan = await getMyClan();
            setMyClan(clan);
        } catch {
            setMyClan(null);
        } finally {
            setLoading(false);
            setHasCheckedClan(true);
        }
    };

    if (!hasCheckedClan) {
        checkMyClan();
    }

    const notify = (msg: string, err = false) => {
        setMessage(msg);
        setIsError(err);
    };

    const handleCreateClan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (clanName.length < 3 || clanName.length > 50) return;
        setActionLoading("create");
        try {
            const clan = await createClan({ name: clanName });
            setMyClan(clan);
            notify("Clan created successfully!");
        } catch (err) {
            notify(err instanceof Error ? err.message : "Failed to create clan", true);
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeave = async () => {
        if (!confirm("Leave this clan?")) return;
        setActionLoading("leave");
        try {
            await leaveClan();
            setMyClan(null);
            notify("You left the clan");
        } catch (err) {
            notify(err instanceof Error ? err.message : "Failed to leave clan", true);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this clan permanently?")) return;
        setActionLoading("delete");
        try {
            await deleteClan(myClan!.id);
            setMyClan(null);
            notify("Clan deleted");
        } catch (err) {
            notify(err instanceof Error ? err.message : "Failed to delete clan", true);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSearch = async () => {
        if (!searchId.trim()) return;
        setActionLoading("search");
        try {
            const clan = await getClanById(searchId);
            setSearchedClan(clan);
        } catch (err) {
            notify(err instanceof Error ? err.message : "Clan not found", true);
            setSearchedClan(null);
        } finally {
            setActionLoading(null);
        }
    };

    const handleJoinRequest = async (clanId: string) => {
        setActionLoading(`join-${clanId}`);
        try {
            await requestToJoinClan(clanId);
            notify("Join request sent!");
        } catch (err) {
            notify(err instanceof Error ? err.message : "Failed to send request", true);
        } finally {
            setActionLoading(null);
        }
    };

    const loadJoinRequests = async () => {
        if (!myClan) return;
        try {
            const requests = await getClanJoinRequests(myClan.id);
            setJoinRequests(requests);
            setShowRequests(true);
        } catch (err) {
            notify(err instanceof Error ? err.message : "Failed to load requests", true);
        }
    };

    const handleRequestAction = async (requestId: string, action: "approve" | "reject") => {
        if (!myClan) return;
        setActionLoading(`${action}-${requestId}`);
        try {
            if (action === "approve") await approveJoinRequest(myClan.id, requestId);
            else await rejectJoinRequest(myClan.id, requestId);
            loadJoinRequests();
            notify(`Request ${action}d`);
        } catch (err) {
            notify(err instanceof Error ? err.message : `Failed to ${action}`, true);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="yomu-page-container space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="yomu-heading-1">
                        <Swords className="h-6 w-6 text-yomu-primary" />
                        Clan
                    </h1>
                    <p className="yomu-text-muted">Manage your clan or join another</p>
                </div>
                {myClan && (
                    <Button variant="outline" size="sm" onClick={checkMyClan}>
                        <RefreshCw className="size-4 mr-1" /> Refresh
                    </Button>
                )}
            </div>

            {message && <Alert variant={isError ? "destructive" : "default"}><AlertDescription>{message}</AlertDescription></Alert>}

            {loading && <p className="text-yomu-text-secondary">Loading...</p>}

            {/* No clan - Create form */}
            {!loading && !myClan && (
                <Card className="yomu-card">
                    <CardHeader>
                        <CardTitle>Create Your Clan</CardTitle>
                        <CardDescription>Start a new clan and recruit members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateClan} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="clanName">Clan Name</Label>
                                <Input
                                    id="clanName"
                                    placeholder="Enter clan name (3-50 chars)"
                                    value={clanName}
                                    onChange={(e) => setClanName(e.target.value)}
                                    minLength={3}
                                    maxLength={50}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={actionLoading === "create"}>
                                <Plus className="size-4 mr-2" />
                                {actionLoading === "create" ? "Creating..." : "Create Clan"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Has clan - Details */}
            {!loading && myClan && (
                <>
                    <Card className="yomu-card">
                        <CardHeader>
                            <CardTitle>{myClan.name}</CardTitle>
                            <CardDescription>Your Clan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${tierColors[myClan.tier]}22`, color: tierColors[myClan.tier] }}>
                                    {myClan.tier}
                                </span>
                                <span className="text-sm text-yomu-text-secondary">Score: {myClan.score.toLocaleString()}</span>
                                <span className="text-sm text-yomu-text-secondary">Members: {myClan.memberCount}</span>
                            </div>
                            <Separator />
                            <div className="flex gap-2">
                                <Button variant="destructive" size="sm" onClick={handleLeave} disabled={actionLoading === "leave"}>
                                    <UserMinus className="size-4 mr-1" /> Leave Clan
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDelete} disabled={actionLoading === "delete"}>
                                    <Shield className="size-4 mr-1" /> Delete Clan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Join Requests (leader only) */}
                    <Card className="yomu-card">
                        <CardHeader>
                            <CardTitle>Join Requests</CardTitle>
                            <CardDescription>Manage pending requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!showRequests ? (
                                <Button variant="outline" size="sm" onClick={loadJoinRequests}>
                                    <ChevronDown className="size-4 mr-1" /> Show Requests
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    {joinRequests.filter((r) => r.status === "PENDING").length === 0 && (
                                        <p className="text-sm text-yomu-text-secondary">No pending requests</p>
                                    )}
                                    {joinRequests.filter((r) => r.status === "PENDING").map((req) => (
                                        <div key={req.id} className="flex items-center justify-between p-3 bg-yomu-background rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium">User: {req.userId.slice(0, 8)}...</p>
                                                <p className="text-xs text-yomu-text-secondary">{new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleRequestAction(req.id, "approve")} disabled={actionLoading === `approve-${req.id}`}>
                                                    <UserPlus className="size-3 mr-1" /> Approve
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleRequestAction(req.id, "reject")} disabled={actionLoading === `reject-${req.id}`}>
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Browse Clans */}
            <Card className="yomu-card">
                <CardHeader>
                    <CardTitle>Browse Clans</CardTitle>
                    <CardDescription>Search for a clan by ID to join</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter clan UUID"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                        <Button onClick={handleSearch} disabled={actionLoading === "search"}>
                            Search
                        </Button>
                    </div>

                    {searchedClan && (
                        <div className="flex items-center justify-between p-4 bg-yomu-background rounded-lg">
                            <div>
                                <p className="font-medium">{searchedClan.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${tierColors[searchedClan.tier]}22`, color: tierColors[searchedClan.tier] }}>
                                        {searchedClan.tier}
                                    </span>
                                    <span className="text-xs text-yomu-text-secondary">Score: {searchedClan.score.toLocaleString()}</span>
                                    <span className="text-xs text-yomu-text-secondary">Members: {searchedClan.memberCount}</span>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => handleJoinRequest(searchedClan.id)} disabled={actionLoading === `join-${searchedClan.id}` || !!myClan}>
                                <UserPlus className="size-3 mr-1" /> Request to Join
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

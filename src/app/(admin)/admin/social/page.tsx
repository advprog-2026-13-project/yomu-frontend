"use client";

import { useState } from "react";
import { Users, ChevronDown, ChevronRight, Trash2, UserMinus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { Clan, JoinRequest, ClanMember } from "@/src/modules/social/types";
import {
    adminGetClans, adminGetClanMembers, adminRemoveMember, adminDeleteClan,
    adminGetJoinRequests, endSeason,
} from "@/src/modules/social/api";

const tierColors: Record<string, string> = {
    BRONZE: "#CD7F32",
    SILVER: "#C0C0C0",
    GOLD: "#FFD700",
    DIAMOND: "#B9F2FF",
};

export default function AdminSocialPage() {
    const [activeTab, setActiveTab] = useState<"clans" | "requests" | "season">("clans");
    const [clans, setClans] = useState<Clan[]>([]);
    const [members, setMembers] = useState<Record<string, ClanMember[]>>({});
    const [expandedClan, setExpandedClan] = useState<string | null>(null);
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [requestFilter, setRequestFilter] = useState<string>("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    const loadClans = async () => {
        setLoading(true);
        try {
            const data = await adminGetClans();
            setClans(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load clans");
        } finally {
            setLoading(false);
        }
    };

    const loadRequests = async () => {
        try {
            const data = await adminGetJoinRequests();
            setRequests(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load requests");
        }
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([loadClans(), loadRequests()]);
        } catch {
            // handled individually
        } finally {
            setLoading(false);
        }
    };

    if (!initialized) {
        setInitialized(true);
        loadData();
    }

    const loadMembers = async (clanId: string) => {
        try {
            const data = await adminGetClanMembers(clanId);
            setMembers((prev) => ({ ...prev, [clanId]: data }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load members");
        }
    };

    const toggleClan = (clanId: string) => {
        if (expandedClan === clanId) {
            setExpandedClan(null);
        } else {
            setExpandedClan(clanId);
            if (!members[clanId]) loadMembers(clanId);
        }
    };

    const handleRemoveMember = async (clanId: string, userId: string) => {
        if (!confirm("Remove this member?")) return;
        setActionLoading(`remove-${userId}`);
        try {
            await adminRemoveMember(clanId, userId);
            loadMembers(clanId);
            loadClans();
            setMessage("Member removed");
        } catch (err) {
            setIsError(true);
            setMessage(err instanceof Error ? err.message : "Failed to remove member");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteClan = async (clanId: string) => {
        if (!confirm("Delete this clan permanently?")) return;
        setActionLoading(`delete-${clanId}`);
        try {
            await adminDeleteClan(clanId);
            loadClans();
            setMessage("Clan deleted");
        } catch (err) {
            setIsError(true);
            setMessage(err instanceof Error ? err.message : "Failed to delete clan");
        } finally {
            setActionLoading(null);
        }
    };

    const handleEndSeason = async () => {
        if (!confirm("End current season? Top 25% will be promoted, bottom 15% demoted.")) return;
        setActionLoading("season");
        try {
            await endSeason();
            setMessage("Season ended successfully");
            loadClans();
        } catch (err) {
            setIsError(true);
            setMessage(err instanceof Error ? err.message : "Failed to end season");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredRequests = requestFilter === "ALL" ? requests : requests.filter((r) => r.status === requestFilter);

    const tierCounts = clans.reduce((acc, c) => {
        acc[c.tier] = (acc[c.tier] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Social Management</h2>
                <p className="text-muted-foreground">Manage clans, join requests, and seasons</p>
            </div>

            {(message || error) && (
                <Alert variant={isError || error ? "destructive" : "default"}>
                    <AlertDescription>{message || error}</AlertDescription>
                </Alert>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                {(["clans", "requests", "season"] as const).map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                            activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === "requests" ? "Join Requests" : tab}
                    </button>
                ))}
            </div>

            {/* Clans Tab */}
            {activeTab === "clans" && (
                <div className="space-y-2">
                    {loading && <p className="text-muted-foreground">Loading clans...</p>}
                    {clans.map((clan) => (
                        <Card key={clan.id}>
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <button onClick={() => toggleClan(clan.id)} className="text-muted-foreground hover:text-foreground">
                                        {expandedClan === clan.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                    </button>
                                    <Users className="size-4 text-primary" />
                                    <div>
                                        <p className="font-medium">{clan.name}</p>
                                        <div className="flex gap-3 mt-1">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${tierColors[clan.tier]}22`, color: tierColors[clan.tier] }}>
                                                {clan.tier}
                                            </span>
                                            <span className="text-xs text-muted-foreground">Score: {clan.score.toLocaleString()}</span>
                                            <span className="text-xs text-muted-foreground">Members: {clan.memberCount}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteClan(clan.id)} disabled={actionLoading === `delete-${clan.id}`}>
                                    <Trash2 className="size-4 text-destructive" />
                                </Button>
                            </div>

                            {expandedClan === clan.id && (
                                <div className="px-4 pb-4">
                                    <Separator className="mb-3" />
                                    <h4 className="text-sm font-medium mb-2">Members</h4>
                                    {(members[clan.id] || []).map((m) => (
                                        <div key={m.userId} className="flex items-center justify-between p-2 bg-background rounded border mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{m.userId.slice(0, 8)}...</span>
                                                <span className="text-xs px-2 py-0.5 rounded bg-muted">{m.role}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(clan.id, m.userId)} disabled={actionLoading === `remove-${m.userId}`}>
                                                <UserMinus className="size-3 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(members[clan.id] || []).length === 0 && (
                                        <p className="text-sm text-muted-foreground">Loading members...</p>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Join Requests Tab */}
            {activeTab === "requests" && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
                            <button
                                key={f}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    requestFilter === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                                onClick={() => setRequestFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        {filteredRequests.map((req) => (
                            <Card key={req.id}>
                                <div className="p-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Request ID: {req.id.slice(0, 8)}...</p>
                                        <div className="flex gap-3 text-xs text-muted-foreground">
                                            <span>Clan: {req.clanId.slice(0, 8)}...</span>
                                            <span>User: {req.userId.slice(0, 8)}...</span>
                                            <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        req.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                        req.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                        "bg-yellow-100 text-yellow-700"
                                    }`}>
                                        {req.status}
                                    </span>
                                </div>
                            </Card>
                        ))}
                        {filteredRequests.length === 0 && (
                            <p className="text-muted-foreground text-center py-8">No requests found</p>
                        )}
                    </div>
                </div>
            )}

            {/* Season Tab */}
            {activeTab === "season" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="size-5 text-destructive" />
                                End Season
                            </CardTitle>
                            <CardDescription>
                                This will promote the top 25% and demote the bottom 15% of clans per tier.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive" onClick={handleEndSeason} disabled={actionLoading === "season"}>
                                {actionLoading === "season" ? "Processing..." : "End Season"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Current Tier Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-4">
                                {(["BRONZE", "SILVER", "GOLD", "DIAMOND"] as const).map((t) => (
                                    <div key={t} className="text-center p-4 rounded-lg" style={{ backgroundColor: `${tierColors[t]}15` }}>
                                        <p className="text-2xl font-bold" style={{ color: tierColors[t] }}>{tierCounts[t] || 0}</p>
                                        <p className="text-sm text-muted-foreground">{t}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

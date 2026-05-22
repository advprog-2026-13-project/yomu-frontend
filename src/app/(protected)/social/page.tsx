"use client";

import { useEffect, useState } from "react";
import { Plus, Shield, Swords, UserPlus, UserMinus, ChevronDown, ChevronUp, RefreshCw, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { Clan, JoinRequest } from "@/src/modules/social/types";
import {
    createClan, getMyClan, leaveClan, deleteClan, getClanById,
    requestToJoinClan, getClanJoinRequests, approveJoinRequest, rejectJoinRequest,
} from "@/src/modules/social/api";

const tierConfig: Record<string, { label: string; bg: string; text: string }> = {
    BRONZE:  { label: "Bronze",  bg: "#F4EAE0", text: "#7A5532" },
    SILVER:  { label: "Silver",  bg: "#E8EDEF", text: "#3D5465" },
    GOLD:    { label: "Gold",    bg: "#F8F0C0", text: "#725A10" },
    DIAMOND: { label: "Diamond", bg: "#D0EFDF", text: "#085041" },
};

function TierBadge({ tier }: { tier: string }) {
    const cfg = tierConfig[tier] ?? { label: tier, bg: "#E8E6DD", text: "#5F5E5A" };
    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: cfg.bg, color: cfg.text }}
        >
            {cfg.label}
        </span>
    );
}

export default function SocialPage() {
    const [myClan, setMyClan] = useState<Clan | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);

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
        }
    };

    useEffect(() => { checkMyClan(); }, []);

    const notify = (msg: string, err = false) => {
        setMessage(msg);
        setIsError(err);
        setTimeout(() => setMessage(null), 4000);
    };

    const handleCreateClan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (clanName.length < 3 || clanName.length > 50) return;
        setActionLoading("create");
        try {
            const clan = await createClan({ name: clanName });
            setMyClan(clan);
            setClanName("");
            notify("Clan berhasil dibuat!");
        } catch (err) {
            notify(err instanceof Error ? err.message : "Gagal membuat clan", true);
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeave = async () => {
        if (!confirm("Tinggalkan clan ini?")) return;
        setActionLoading("leave");
        try {
            await leaveClan();
            setMyClan(null);
            notify("Kamu telah meninggalkan clan");
        } catch (err) {
            notify(err instanceof Error ? err.message : "Gagal meninggalkan clan", true);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Hapus clan ini secara permanen?")) return;
        setActionLoading("delete");
        try {
            await deleteClan(myClan!.id);
            setMyClan(null);
            notify("Clan dihapus");
        } catch (err) {
            notify(err instanceof Error ? err.message : "Gagal menghapus clan", true);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSearch = async () => {
        if (!searchId.trim()) return;
        setActionLoading("search");
        setSearchedClan(null);
        try {
            const clan = await getClanById(searchId.trim());
            setSearchedClan(clan);
        } catch (err) {
            notify(err instanceof Error ? err.message : "Clan tidak ditemukan", true);
        } finally {
            setActionLoading(null);
        }
    };

    const handleJoinRequest = async (clanId: string) => {
        setActionLoading(`join-${clanId}`);
        try {
            await requestToJoinClan(clanId);
            notify("Permintaan bergabung terkirim!");
        } catch (err) {
            notify(err instanceof Error ? err.message : "Gagal mengirim permintaan", true);
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
            notify(err instanceof Error ? err.message : "Gagal memuat permintaan", true);
        }
    };

    const handleRequestAction = async (requestId: string, action: "approve" | "reject") => {
        if (!myClan) return;
        setActionLoading(`${action}-${requestId}`);
        try {
            if (action === "approve") await approveJoinRequest(myClan.id, requestId);
            else await rejectJoinRequest(myClan.id, requestId);
            await loadJoinRequests();
            notify(action === "approve" ? "Permintaan disetujui" : "Permintaan ditolak");
        } catch (err) {
            notify(err instanceof Error ? err.message : `Gagal memproses permintaan`, true);
        } finally {
            setActionLoading(null);
        }
    };

    const pendingCount = joinRequests.filter((r) => r.status === "PENDING").length;

    return (
        <div className="yomu-page-container space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="yomu-heading-1">
                        <Swords className="h-6 w-6 text-yomu-primary" />
                        Clan
                    </h1>
                    <p className="yomu-text-muted">Kelola clan atau bergabung dengan yang lain</p>
                </div>
                <div className="flex items-center gap-2">
                    {myClan && (
                        <Button variant="ghost" size="sm" onClick={checkMyClan} disabled={loading}>
                            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    )}
                    <Link href="/social/leaderboard">
                        <Button variant="outline" size="sm">
                            <Trophy className="size-4 mr-1.5" />
                            Leaderboard
                        </Button>
                    </Link>
                </div>
            </div>

            {message && (
                <Alert variant={isError ? "destructive" : "default"}>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            {/* Loading skeletons */}
            {loading && (
                <div className="space-y-3">
                    <div className="h-32 rounded-xl bg-muted animate-pulse" />
                    <div className="h-20 rounded-xl bg-muted animate-pulse" />
                </div>
            )}

            {/* No clan */}
            {!loading && !myClan && (
                <>
                    <div className="bg-yomu-surface border border-yomu-border rounded-xl p-6">
                        <h2 className="text-base font-semibold mb-1">Buat Clan</h2>
                        <p className="text-sm text-yomu-text-secondary mb-4">Dirikan clan baru dan rekrut anggota</p>
                        <form onSubmit={handleCreateClan} className="flex gap-3 items-end">
                            <div className="flex-1 space-y-1.5">
                                <Label htmlFor="clanName">Nama Clan</Label>
                                <Input
                                    id="clanName"
                                    placeholder="3–50 karakter"
                                    value={clanName}
                                    onChange={(e) => setClanName(e.target.value)}
                                    minLength={3}
                                    maxLength={50}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={actionLoading === "create"}>
                                <Plus className="size-4 mr-1.5" />
                                {actionLoading === "create" ? "Membuat..." : "Buat"}
                            </Button>
                        </form>
                    </div>

                    <div className="bg-yomu-surface border border-yomu-border rounded-xl p-6">
                        <h2 className="text-base font-semibold mb-1">Cari Clan</h2>
                        <p className="text-sm text-yomu-text-secondary mb-4">
                            Masukkan ID clan yang dibagikan oleh anggota atau ketua clan
                        </p>
                        <div className="flex gap-3">
                            <Input
                                placeholder="Clan ID (UUID)"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <Button
                                variant="outline"
                                onClick={handleSearch}
                                disabled={actionLoading === "search" || !searchId.trim()}
                            >
                                {actionLoading === "search" ? "Mencari..." : "Cari"}
                            </Button>
                        </div>
                        {searchedClan && (
                            <div className="mt-4 flex items-center justify-between p-4 bg-yomu-background rounded-lg">
                                <div className="space-y-1.5">
                                    <p className="text-sm font-semibold">{searchedClan.name}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <TierBadge tier={searchedClan.tier} />
                                        <span className="text-xs text-yomu-text-secondary">
                                            {searchedClan.score.toLocaleString("id-ID")} poin
                                        </span>
                                        <span className="text-xs text-yomu-text-secondary">
                                            {searchedClan.memberCount} anggota
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleJoinRequest(searchedClan.id)}
                                    disabled={!!actionLoading}
                                >
                                    <UserPlus className="size-3.5 mr-1.5" />
                                    Minta Gabung
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Has clan */}
            {!loading && myClan && (
                <>
                    {/* Clan info */}
                    <div className="bg-yomu-surface border border-yomu-border rounded-xl overflow-hidden">
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <h2 className="text-lg font-semibold">{myClan.name}</h2>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <TierBadge tier={myClan.tier} />
                                        <span className="text-sm text-yomu-text-secondary">
                                            {myClan.score.toLocaleString("id-ID")} poin
                                        </span>
                                        <span className="text-sm text-yomu-text-secondary">
                                            {myClan.memberCount} anggota
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="px-6 py-4 flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLeave}
                                disabled={!!actionLoading}
                            >
                                <UserMinus className="size-4 mr-1.5" />
                                {actionLoading === "leave" ? "Keluar..." : "Tinggalkan"}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                disabled={!!actionLoading}
                            >
                                <Shield className="size-4 mr-1.5" />
                                {actionLoading === "delete" ? "Menghapus..." : "Hapus Clan"}
                            </Button>
                        </div>
                    </div>

                    {/* Join requests (expandable, leader-only via API) */}
                    <div className="bg-yomu-surface border border-yomu-border rounded-xl overflow-hidden">
                        <button
                            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-yomu-background transition-colors cursor-pointer"
                            onClick={() => showRequests ? setShowRequests(false) : loadJoinRequests()}
                        >
                            <div>
                                <p className="text-sm font-semibold">Permintaan Bergabung</p>
                                {pendingCount > 0 && !showRequests && (
                                    <p className="text-xs text-yomu-text-secondary mt-0.5">
                                        {pendingCount} menunggu persetujuan
                                    </p>
                                )}
                            </div>
                            {showRequests
                                ? <ChevronUp className="size-4 text-yomu-text-secondary shrink-0" />
                                : <ChevronDown className="size-4 text-yomu-text-secondary shrink-0" />}
                        </button>

                        {showRequests && (
                            <>
                                <Separator />
                                <div className="px-6 py-4">
                                    {joinRequests.filter((r) => r.status === "PENDING").length === 0 ? (
                                        <p className="text-sm text-yomu-text-secondary py-2">
                                            Tidak ada permintaan yang menunggu
                                        </p>
                                    ) : (
                                        <div className="space-y-0">
                                            {joinRequests
                                                .filter((r) => r.status === "PENDING")
                                                .map((req) => (
                                                    <div
                                                        key={req.id}
                                                        className="flex items-center justify-between py-3 border-b border-yomu-border last:border-0"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                User {req.userId.slice(0, 8)}&hellip;
                                                            </p>
                                                            <p className="text-xs text-yomu-text-secondary">
                                                                {new Date(req.createdAt).toLocaleDateString("id-ID", {
                                                                    day: "numeric", month: "short", year: "numeric",
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleRequestAction(req.id, "approve")}
                                                                disabled={!!actionLoading}
                                                            >
                                                                <UserPlus className="size-3.5 mr-1" />
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRequestAction(req.id, "reject")}
                                                                disabled={!!actionLoading}
                                                            >
                                                                Tolak
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Search clan by ID */}
                    <div className="bg-yomu-surface border border-yomu-border rounded-xl p-6">
                        <h2 className="text-base font-semibold mb-1">Cari Clan Lain</h2>
                        <p className="text-sm text-yomu-text-secondary mb-4">
                            Cari informasi clan menggunakan ID-nya
                        </p>
                        <div className="flex gap-3">
                            <Input
                                placeholder="Clan ID (UUID)"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <Button
                                variant="outline"
                                onClick={handleSearch}
                                disabled={actionLoading === "search" || !searchId.trim()}
                            >
                                {actionLoading === "search" ? "Mencari..." : "Cari"}
                            </Button>
                        </div>
                        {searchedClan && (
                            <div className="mt-4 p-4 bg-yomu-background rounded-lg">
                                <p className="text-sm font-semibold">{searchedClan.name}</p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <TierBadge tier={searchedClan.tier} />
                                    <span className="text-xs text-yomu-text-secondary">
                                        {searchedClan.score.toLocaleString("id-ID")} poin
                                    </span>
                                    <span className="text-xs text-yomu-text-secondary">
                                        {searchedClan.memberCount} anggota
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

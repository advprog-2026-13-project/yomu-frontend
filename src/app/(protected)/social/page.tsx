"use client";

import { useState } from "react";
import {
    Plus, Swords, UserPlus, UserMinus, ChevronDown, ChevronUp, ChevronRight,
    RefreshCw, Trophy, Copy, Check, Trash2, Shield, Star, Crown,
    Gem, Users, Zap, Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/src/modules/auth";
import { ModifierBadges } from "@/src/modules/social/components/ModifierBadges";
import type { Clan, JoinRequest } from "@/src/modules/social/types";
import {
    createClan, getMyClan, leaveClan, deleteClan, getClanById,
    requestToJoinClan, getClanJoinRequests, approveJoinRequest, rejectJoinRequest,
} from "@/src/modules/social/api";

type TierMeta = {
    label: string;
    bg: string;
    text: string;
    accentHex: string;
    Icon: React.ComponentType<{ className?: string }>;
};

const tierConfig: Record<string, TierMeta> = {
    BRONZE:  { label: "Bronze",  bg: "#F4EAE0", text: "#7A5532", accentHex: "#A07850", Icon: Shield },
    SILVER:  { label: "Silver",  bg: "#E8EDEF", text: "#3D5465", accentHex: "#6B7A8A", Icon: Star },
    GOLD:    { label: "Gold",    bg: "#F8F0C0", text: "#725A10", accentHex: "#B8901C", Icon: Crown },
    DIAMOND: { label: "Diamond", bg: "#D0EFDF", text: "#085041", accentHex: "#1D9E75", Icon: Gem },
};

function TierBadge({ tier }: { tier: string }) {
    const cfg = tierConfig[tier] ?? { label: tier, bg: "#E8E6DD", text: "#5F5E5A", accentHex: "#9E9C96", Icon: Shield };
    const Icon = cfg.Icon;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: cfg.bg, color: cfg.text }}
        >
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
}

function StatPill({ icon: Icon, value, label }: { icon: React.ElementType; value: string | number; label: string }) {
    return (
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
            <Icon className="h-4 w-4 text-yomu-accent" />
            <span className="font-semibold">{value}</span>
            <span className="text-white/75">{label}</span>
        </div>
    );
}

function ClanIdCopy({ id }: { id: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(id).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-yomu-text-secondary hover:text-yomu-primary hover:bg-yomu-primary-light transition-colors duration-150 cursor-pointer"
            title="Salin ID Clan"
        >
            <span>{id.slice(0, 8)}&hellip;</span>
            {copied ? <Check className="w-3 h-3 text-yomu-primary" /> : <Copy className="w-3 h-3" />}
        </button>
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
    const [initialized, setInitialized] = useState(false);

    const checkMyClan = async () => {
        setLoading(true);
        try {
            setMyClan(await getMyClan());
        } catch {
            setMyClan(null);
        } finally {
            setLoading(false);
        }
    };

    if (!initialized) {
        setInitialized(true);
        checkMyClan();
    }

    const notify = (msg: string, err = false) => {
        setMessage(msg); setIsError(err);
        setTimeout(() => setMessage(null), 4000);
    };

    const handleCreateClan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (clanName.length < 3 || clanName.length > 50) return;
        setActionLoading("create");
        try {
            setMyClan(await createClan({ name: clanName }));
            setClanName("");
            notify("Clan berhasil dibuat!");
        } catch (err) {
            notify(err instanceof Error ? err.message : "Gagal membuat clan", true);
        } finally { setActionLoading(null); }
    };

    const handleLeave = async () => {
        if (!confirm("Tinggalkan clan ini?")) return;
        setActionLoading("leave");
        try {
            await leaveClan(); setMyClan(null); notify("Kamu telah meninggalkan clan");
        } catch (err) {
            await checkMyClan();
            notify(err instanceof Error ? err.message : "Gagal meninggalkan clan", true);
        } finally { setActionLoading(null); }
    };

    const handleDelete = async () => {
        if (!confirm("Hapus clan ini secara permanen?")) return;
        setActionLoading("delete");
        try {
            await deleteClan(myClan!.id); setMyClan(null); notify("Clan dihapus");
        } catch (err) {
            await checkMyClan();
            notify(err instanceof Error ? err.message : "Gagal menghapus clan", true);
        } finally { setActionLoading(null); }
    };

    const handleSearch = async () => {
        if (!searchId.trim()) return;
        setActionLoading("search"); setSearchedClan(null);
        try {
            setSearchedClan(await getClanById(searchId.trim()));
        } catch (err) {
            notify(err instanceof Error ? err.message : "Clan tidak ditemukan", true);
        } finally { setActionLoading(null); }
    };

    const handleJoinRequest = async (clanId: string) => {
        setActionLoading(`join-${clanId}`);
        try {
            await requestToJoinClan(clanId); notify("Permintaan bergabung terkirim!");
        } catch (err) {
            notify(err instanceof Error ? err.message : "Gagal mengirim permintaan", true);
        } finally { setActionLoading(null); }
    };

    const loadJoinRequests = async () => {
        if (!myClan) return;
        try {
            setJoinRequests(await getClanJoinRequests(myClan.id));
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
            notify(err instanceof Error ? err.message : "Gagal memproses permintaan", true);
        } finally { setActionLoading(null); }
    };

    const { user } = useAuth();
    const isLeader = !!myClan && user?.id === myClan.leaderId;
    const pendingCount = joinRequests.filter((r) => r.status === "PENDING").length;
    const tierCfg = myClan ? (tierConfig[myClan.tier] ?? tierConfig.BRONZE) : null;

    return (
        <div className="min-h-screen bg-yomu-background">
            <div className="bg-gradient-to-br from-yomu-primary-dark via-yomu-primary to-[#2ab888] text-white">
                <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Swords className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-white/75 text-sm font-medium uppercase tracking-widest">
                            Kompetisi Clan
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 leading-tight">
                        {loading ? "Clan & Liga" : myClan ? myClan.name : "Clan & Liga"}
                    </h1>
                    <p className="text-white/75 text-base max-w-xl leading-relaxed">
                        {myClan
                            ? "Kelola clan, setujui anggota baru, dan pantau posisi di leaderboard."
                            : "Bergabung dengan clan, kumpulkan poin bersama, dan bersaing di liga."}
                    </p>

                    {!loading && myClan && tierCfg && (
                        <div className="flex flex-wrap gap-3 mt-8">
                            <Link href={`/social/leaderboard?tier=${myClan.tier}`}>
                                <div className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full px-4 py-2 text-sm transition-colors duration-150 cursor-pointer">
                                    <tierCfg.Icon className="h-4 w-4 text-yomu-accent" />
                                    <span className="font-semibold">Liga {tierCfg.label}</span>
                                    <ChevronRight className="h-3.5 w-3.5 text-white/60" />
                                </div>
                            </Link>
                            <StatPill icon={Zap} value={myClan.score.toLocaleString("id-ID")} label="poin" />
                            <StatPill icon={Users} value={myClan.memberCount} label="anggota" />
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
                <Link href="/social/leaderboard" className="block group">
                    <div className="bg-yomu-surface border border-yomu-accent/30 rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between hover:border-yomu-accent/60 hover:shadow-md transition-all duration-200 cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                                 style={{ background: "linear-gradient(135deg, #EF9F27, #c97d10)" }}>
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-yomu-foreground">Liga &amp; Leaderboard</p>
                                <p className="text-xs text-yomu-text-secondary">Lihat peringkat semua clan berdasarkan tier</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-yomu-accent group-hover:gap-2.5 transition-all duration-200">
                            Lihat
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </Link>

                {message && (
                    <Alert variant={isError ? "destructive" : "default"}>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-yomu-primary-light flex items-center justify-center">
                                <Swords className="h-7 w-7 text-yomu-primary" />
                            </div>
                            <Loader2 className="absolute -top-1 -right-1 h-5 w-5 text-yomu-primary animate-spin" />
                        </div>
                        <p className="text-yomu-text-secondary text-sm">Memuat data clan...</p>
                    </div>
                )}

                {!loading && !myClan && (
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="bg-yomu-surface border border-yomu-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-yomu-primary-light flex items-center justify-center text-yomu-primary shadow-inner">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-yomu-foreground">Buat Clan</h2>
                                    <p className="text-xs text-yomu-text-secondary">Dirikan clan dan rekrut anggota</p>
                                </div>
                            </div>
                            <form onSubmit={handleCreateClan} className="space-y-3">
                                <div className="space-y-1.5">
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
                                <Button
                                    type="submit"
                                    className="w-full cursor-pointer"
                                    disabled={actionLoading === "create"}
                                >
                                    <Plus className="size-4 mr-1.5" />
                                    {actionLoading === "create" ? "Membuat..." : "Buat Clan"}
                                </Button>
                            </form>
                        </div>

                        <div className="bg-yomu-surface border border-yomu-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-yomu-accent-light flex items-center justify-center text-yomu-accent shadow-inner">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-yomu-foreground">Cari & Bergabung</h2>
                                    <p className="text-xs text-yomu-text-secondary">Masukkan ID clan yang dibagikan</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex gap-2">
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
                                        className="cursor-pointer shrink-0"
                                    >
                                        {actionLoading === "search" ? "..." : "Cari"}
                                    </Button>
                                </div>
                                {searchedClan && (
                                    <div className="flex items-center justify-between p-4 bg-yomu-background rounded-xl border border-yomu-border">
                                        <div className="space-y-1.5">
                                            <Link href={`/social/clan/${searchedClan.id}`} className="text-sm font-semibold hover:text-yomu-primary transition-colors cursor-pointer">{searchedClan.name}</Link>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <TierBadge tier={searchedClan.tier} />
                                                <span className="text-xs text-yomu-text-secondary">{searchedClan.score.toLocaleString("id-ID")} poin</span>
                                                <span className="text-xs text-yomu-text-secondary">{searchedClan.memberCount} anggota</span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleJoinRequest(searchedClan.id)}
                                            disabled={!!actionLoading}
                                            className="cursor-pointer ml-3 shrink-0"
                                        >
                                            <UserPlus className="size-3.5 mr-1.5" />
                                            Gabung
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!loading && myClan && tierCfg && (
                    <>
                        <div className="bg-yomu-surface border border-yomu-border rounded-2xl overflow-hidden shadow-sm">
                            <div className="h-1.5" style={{ backgroundColor: tierCfg.accentHex }} />
                            <div className="px-6 pt-5 pb-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <Link href={`/social/clan/${myClan.id}`} className="group">
                                                <h2 className="text-2xl font-bold text-yomu-foreground font-heading group-hover:text-yomu-primary transition-colors duration-150 cursor-pointer">
                                                    {myClan.name}
                                                </h2>
                                            </Link>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-xs text-yomu-text-secondary">ID Clan:</span>
                                                <ClanIdCopy id={myClan.id} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <Link href={`/social/leaderboard?tier=${myClan.tier}`}>
                                                <TierBadge tier={myClan.tier} />
                                            </Link>
                                            <span className="text-sm font-semibold text-yomu-foreground">
                                                {myClan.score.toLocaleString("id-ID")}
                                                <span className="text-xs font-normal text-yomu-text-secondary ml-1">poin</span>
                                            </span>
                                            <span className="text-sm text-yomu-text-secondary">{myClan.memberCount} anggota</span>
                                        </div>
                                        {myClan.modifiers && (myClan.modifiers.productivityBuffActive || myClan.modifiers.lowAccuracyPenaltyActive) && (
                                            <ModifierBadges
                                                buffActive={myClan.modifiers.productivityBuffActive}
                                                debuffActive={myClan.modifiers.lowAccuracyPenaltyActive}
                                            />
                                        )}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={checkMyClan} disabled={loading} className="cursor-pointer shrink-0 mt-1">
                                        <RefreshCw className="size-4" />
                                    </Button>
                                </div>
                            </div>
                            {!isLeader && (
                                <>
                                    <Separator />
                                    <div className="px-6 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleLeave}
                                            disabled={!!actionLoading}
                                            className="cursor-pointer"
                                        >
                                            <UserMinus className="size-4 mr-1.5" />
                                            {actionLoading === "leave" ? "Keluar..." : "Tinggalkan Clan"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        {isLeader && <div className="bg-yomu-surface border border-yomu-border rounded-2xl overflow-hidden shadow-sm">
                            <button
                                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-yomu-background transition-colors duration-150 cursor-pointer"
                                onClick={() => showRequests ? setShowRequests(false) : loadJoinRequests()}
                            >
                                <div className="flex items-center gap-2.5">
                                    <p className="text-sm font-semibold">Permintaan Bergabung</p>
                                    {pendingCount > 0 && !showRequests && (
                                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-bold text-white bg-yomu-primary">
                                            {pendingCount}
                                        </span>
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
                                            <p className="text-sm text-yomu-text-secondary py-2">Tidak ada permintaan yang menunggu</p>
                                        ) : (
                                            <div>
                                                {joinRequests.filter((r) => r.status === "PENDING").map((req) => (
                                                    <div
                                                        key={req.id}
                                                        className="flex items-center justify-between py-3 border-b border-yomu-border last:border-0"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-yomu-primary-light flex items-center justify-center shrink-0">
                                                                <span className="text-xs font-bold text-yomu-primary uppercase">
                                                                    {(req.username ?? req.userId).slice(0, 2)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{req.username ?? `${req.userId.slice(0, 8)}…`}</p>
                                                                <p className="text-xs text-yomu-text-secondary">
                                                                    {new Date(req.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => handleRequestAction(req.id, "approve")} disabled={!!actionLoading} className="cursor-pointer">
                                                                <UserPlus className="size-3.5 mr-1" />Setujui
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => handleRequestAction(req.id, "reject")} disabled={!!actionLoading} className="cursor-pointer">
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
                        </div>}

                        <div className="bg-yomu-surface border border-yomu-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-yomu-background flex items-center justify-center text-yomu-text-secondary">
                                    <Swords className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-yomu-foreground">Cari Clan Lain</h2>
                                    <p className="text-xs text-yomu-text-secondary">Cari informasi clan dengan ID-nya</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
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
                                    className="cursor-pointer shrink-0"
                                >
                                    {actionLoading === "search" ? "..." : "Cari"}
                                </Button>
                            </div>
                            {searchedClan && (
                                <div className="mt-3 p-4 bg-yomu-background rounded-xl border border-yomu-border">
                                    <Link href={`/social/clan/${searchedClan.id}`} className="text-sm font-semibold hover:text-yomu-primary transition-colors cursor-pointer">{searchedClan.name}</Link>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <TierBadge tier={searchedClan.tier} />
                                        <span className="text-xs text-yomu-text-secondary">{searchedClan.score.toLocaleString("id-ID")} poin</span>
                                        <span className="text-xs text-yomu-text-secondary">{searchedClan.memberCount} anggota</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isLeader && (
                            <div className="bg-yomu-surface border border-yomu-destructive/25 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-base font-bold text-yomu-destructive mb-1">Zona Berbahaya</h2>
                                <p className="text-sm text-yomu-text-secondary mb-4">
                                    Menghapus clan akan mengeluarkan semua anggota secara permanen. Tindakan ini tidak dapat dibatalkan.
                                </p>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={!!actionLoading}
                                    className="cursor-pointer"
                                >
                                    <Trash2 className="size-4 mr-1.5" />
                                    {actionLoading === "delete" ? "Menghapus..." : "Hapus Clan"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Shield, Star, Crown, Gem, Users, Zap,
    Loader2, AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/src/modules/auth";
import type { Clan, ClanMember } from "@/src/modules/social/types";
import { getClanById, getClanMembers } from "@/src/modules/social/api";

const tierConfig: Record<string, {
    label: string;
    bg: string;
    text: string;
    accentHex: string;
    heroGradient: string;
    Icon: React.ComponentType<{ className?: string }>;
}> = {
    BRONZE:  { label: "Bronze",  bg: "#F4EAE0", text: "#7A5532", accentHex: "#A07850", heroGradient: "from-amber-950 via-amber-800 to-amber-700",  Icon: Shield },
    SILVER:  { label: "Silver",  bg: "#E8EDEF", text: "#3D5465", accentHex: "#6B7A8A", heroGradient: "from-slate-800 via-slate-600 to-slate-500",  Icon: Star   },
    GOLD:    { label: "Gold",    bg: "#F8F0C0", text: "#725A10", accentHex: "#B8901C", heroGradient: "from-yellow-950 via-yellow-800 to-amber-600", Icon: Crown  },
    DIAMOND: { label: "Diamond", bg: "#D0EFDF", text: "#085041", accentHex: "#1D9E75", heroGradient: "from-teal-950 via-teal-800 to-emerald-600",  Icon: Gem    },
};

function MemberAvatar({ name }: { name: string }) {
    return (
        <div className="w-10 h-10 rounded-full bg-yomu-primary-light border-2 border-yomu-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-yomu-primary uppercase">
                {name.slice(0, 2)}
            </span>
        </div>
    );
}

function SkeletonMember() {
    return (
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-yomu-border last:border-0">
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 h-4 rounded-md bg-muted animate-pulse" />
            <div className="w-16 h-5 rounded-full bg-muted animate-pulse" />
        </div>
    );
}

export default function ClanDetailPage() {
    const { clanId } = useParams<{ clanId: string }>();
    const { user } = useAuth();

    const [clan, setClan] = useState<Clan | null>(null);
    const [members, setMembers] = useState<ClanMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!clanId) return;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [clanData, memberData] = await Promise.all([
                    getClanById(clanId),
                    getClanMembers(clanId),
                ]);
                setClan(clanData);
                setMembers(memberData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Gagal memuat data clan");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [clanId]);

    const cfg = clan ? (tierConfig[clan.tier] ?? tierConfig.BRONZE) : tierConfig.DIAMOND;
    const TierIcon = cfg.Icon;
    const currentUserId = user?.id;
    const isMyMember = members.some((m) => m.userId === currentUserId);
    const myRole = members.find((m) => m.userId === currentUserId)?.role;

    const leaders = members.filter((m) => m.role === "LEADER");
    const regularMembers = members.filter((m) => m.role === "MEMBER");

    return (
        <div className="min-h-screen bg-yomu-background">

            {/* ── Hero ── */}
            <div className={`bg-gradient-to-br ${cfg.heroGradient} text-white`}>
                <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">

                    {/* Back link */}
                    <Link
                        href="/social"
                        className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Social
                    </Link>

                    {/* Icon + label */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <TierIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-white/75 text-sm font-medium uppercase tracking-widest">
                            {loading ? "Memuat…" : `Liga ${cfg.label}`}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 leading-tight">
                        {loading ? "…" : (clan?.name ?? "Clan tidak ditemukan")}
                    </h1>

                    {/* Stat pills */}
                    {!loading && clan && (
                        <div className="flex flex-wrap gap-3 mt-2">
                            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                                <Zap className="h-4 w-4 text-yomu-accent" />
                                <span className="font-semibold">{clan.score.toLocaleString("id-ID")}</span>
                                <span className="text-white/75">poin</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                                <Users className="h-4 w-4 text-white/80" />
                                <span className="font-semibold">{clan.memberCount}</span>
                                <span className="text-white/75">anggota</span>
                            </div>
                            {isMyMember && (
                                <div className="flex items-center gap-2 bg-white/25 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold">
                                    {myRole === "LEADER" ? "Ketua" : "Anggota"} clan ini
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-5xl mx-auto px-4 -mt-6 pb-10 space-y-5">

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Members card */}
                <div className="bg-yomu-surface rounded-2xl border border-yomu-border overflow-hidden shadow-sm">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-yomu-border bg-yomu-background">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-yomu-text-secondary" />
                            <span className="text-sm font-semibold text-yomu-foreground">Anggota Clan</span>
                        </div>
                        {!loading && (
                            <span className="text-xs text-yomu-text-secondary">{members.length} orang</span>
                        )}
                    </div>

                    {loading && (
                        <>{[0, 1, 2].map((i) => <SkeletonMember key={i} />)}</>
                    )}

                    {!loading && members.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-yomu-background flex items-center justify-center">
                                <Users className="w-6 h-6 text-yomu-text-secondary" />
                            </div>
                            <p className="text-sm text-yomu-text-secondary">Belum ada anggota</p>
                        </div>
                    )}

                    {!loading && members.length > 0 && (
                        <ul>
                            {/* Leaders first */}
                            {leaders.map((m) => (
                                <li
                                    key={m.userId}
                                    className="flex items-center gap-3 px-5 py-3.5 border-b border-yomu-border last:border-0 hover:bg-yomu-background transition-colors"
                                >
                                    <MemberAvatar name={m.username ?? m.userId} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-yomu-foreground truncate">
                                            {m.username ?? `${m.userId.slice(0, 8)}…`}
                                        </p>
                                    </div>
                                    <span
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0"
                                        style={{ backgroundColor: `${cfg.accentHex}18`, color: cfg.accentHex }}
                                    >
                                        <Crown className="w-3 h-3" />
                                        Ketua
                                    </span>
                                </li>
                            ))}
                            {/* Regular members */}
                            {regularMembers.map((m) => (
                                <li
                                    key={m.userId}
                                    className="flex items-center gap-3 px-5 py-3.5 border-b border-yomu-border last:border-0 hover:bg-yomu-background transition-colors"
                                >
                                    <MemberAvatar name={m.username ?? m.userId} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-yomu-foreground truncate">
                                            {m.username ?? `${m.userId.slice(0, 8)}…`}
                                        </p>
                                    </div>
                                    <span className="text-xs text-yomu-text-secondary shrink-0 px-2.5 py-0.5 rounded-full bg-yomu-background">
                                        Anggota
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Loader for initial load error */}
                {loading && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-yomu-primary animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}

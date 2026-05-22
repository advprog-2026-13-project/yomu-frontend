"use client";

import { useEffect, useState } from "react";
import { Trophy, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { LeaderboardEntry, ClanTier } from "@/src/modules/social/types";
import { getLeaderboard } from "@/src/modules/social/api";

const TIERS: ClanTier[] = ["BRONZE", "SILVER", "GOLD", "DIAMOND"];

const tierConfig: Record<ClanTier, {
    label: string;
    activeBg: string;
    activeText: string;
    rowTint: string;
}> = {
    BRONZE: { label: "Bronze", activeBg: "#A07850", activeText: "#FFFFFF", rowTint: "#F9F4EF" },
    SILVER: { label: "Silver", activeBg: "#6B7A8A", activeText: "#FFFFFF", rowTint: "#F2F4F7" },
    GOLD:   { label: "Gold",   activeBg: "#B8901C", activeText: "#FFFFFF", rowTint: "#FBF6E2" },
    DIAMOND:{ label: "Diamond",activeBg: "#1D9E75", activeText: "#FFFFFF", rowTint: "#EBF8F3" },
};

function RankBadge({ rank }: { rank: number }) {
    const base = "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0";
    if (rank === 1) return <span className={base} style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>1</span>;
    if (rank === 2) return <span className={base} style={{ backgroundColor: "#F1F5F9", color: "#475569" }}>2</span>;
    if (rank === 3) return <span className={base} style={{ backgroundColor: "#FEF2E8", color: "#9A3412" }}>3</span>;
    return (
        <span className="inline-flex items-center justify-center w-8 h-8 text-sm shrink-0 text-yomu-text-secondary tabular-nums">
            {rank}
        </span>
    );
}

function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 px-5 py-4 border-b border-yomu-border last:border-0">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 h-4 rounded-md bg-muted animate-pulse" />
            <div className="w-20 h-4 rounded-md bg-muted animate-pulse" />
        </div>
    );
}

export default function LeaderboardPage() {
    const [tier, setTier] = useState<ClanTier>("BRONZE");
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (selectedTier: ClanTier) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getLeaderboard(selectedTier);
            setEntries(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memuat leaderboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData("BRONZE"); }, []);

    const handleTierChange = (selected: ClanTier) => {
        setTier(selected);
        loadData(selected);
    };

    const config = tierConfig[tier];
    const tierIndex = TIERS.indexOf(tier);

    return (
        <div className="yomu-page-container space-y-6">
            <div>
                <h1 className="yomu-heading-1">
                    <Trophy className="h-6 w-6 text-yomu-accent" />
                    Leaderboard
                </h1>
                <p className="yomu-text-muted">Peringkat clan berdasarkan tier</p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Tier selector */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
                {TIERS.map((t) => {
                    const isActive = tier === t;
                    const cfg = tierConfig[t];
                    return (
                        <button
                            key={t}
                            onClick={() => handleTierChange(t)}
                            className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
                            style={
                                isActive
                                    ? { backgroundColor: cfg.activeBg, color: cfg.activeText }
                                    : { color: "var(--text-secondary)", backgroundColor: "transparent" }
                            }
                        >
                            {cfg.label}
                        </button>
                    );
                })}
            </div>

            {/* Rankings */}
            <div className="bg-yomu-surface border border-yomu-border rounded-xl overflow-hidden">
                {/* Column headers */}
                <div className="flex items-center gap-4 px-5 py-3 border-b border-yomu-border bg-yomu-background">
                    <div className="w-8 shrink-0" />
                    <div className="flex-1 text-xs font-medium text-yomu-text-secondary uppercase tracking-wider">Clan</div>
                    <div className="text-xs font-medium text-yomu-text-secondary uppercase tracking-wider">Skor</div>
                </div>

                {loading ? (
                    <>{[0, 1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}</>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-yomu-background flex items-center justify-center">
                            <Users className="w-6 h-6 text-yomu-text-secondary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Belum ada clan di tier {config.label}</p>
                            <p className="text-sm text-yomu-text-secondary max-w-xs">
                                {tierIndex === 0
                                    ? "Buat clan dan mulai membaca untuk masuk peringkat."
                                    : `Clan naik ke sini dari tier ${tierConfig[TIERS[tierIndex - 1]].label} saat masuk 25% teratas.`}
                            </p>
                        </div>
                    </div>
                ) : (
                    <ol>
                        {entries.map((entry) => {
                            const isTop3 = entry.rank <= 3;
                            return (
                                <li
                                    key={entry.clanId}
                                    className="flex items-center gap-4 px-5 py-4 border-b border-yomu-border last:border-0"
                                    style={isTop3 ? { backgroundColor: config.rowTint } : {}}
                                >
                                    <RankBadge rank={entry.rank} />
                                    <span className={`flex-1 text-sm ${isTop3 ? "font-semibold" : "font-medium"}`}>
                                        {entry.clanName}
                                    </span>
                                    <span className="text-sm tabular-nums text-yomu-text-secondary">
                                        {entry.score.toLocaleString("id-ID")}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </div>

            {/* Season mechanics note */}
            {!loading && entries.length > 0 && (
                <p className="text-xs text-yomu-text-secondary text-center">
                    {tier === "DIAMOND"
                        ? "Tier tertinggi. 15% terbawah turun ke Gold setiap akhir season."
                        : `25% teratas naik ke ${tierConfig[TIERS[tierIndex + 1]].label}. 15% terbawah turun. Diperbarui tiap akhir season.`}
                </p>
            )}
        </div>
    );
}

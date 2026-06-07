"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, Crown, Star, Shield, Gem, Award, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { LeaderboardEntry, ClanTier } from "@/src/modules/social/types";
import { getLeaderboard } from "@/src/modules/social/api";
import { ModifierBadges } from "@/src/modules/social/components/ModifierBadges";

const TIERS: ClanTier[] = ["BRONZE", "SILVER", "GOLD", "DIAMOND"];

type TierMeta = {
    label: string;
    heroGradient: string;
    activeBg: string;
    accentHex: string;
    Icon: React.ComponentType<{ className?: string }>;
};

const tierConfig: Record<ClanTier, TierMeta> = {
    BRONZE:  { label: "Bronze",  heroGradient: "from-amber-950 via-amber-800 to-amber-700",  activeBg: "#A07850", accentHex: "#A07850", Icon: Shield },
    SILVER:  { label: "Silver",  heroGradient: "from-slate-800 via-slate-600 to-slate-500",  activeBg: "#6B7A8A", accentHex: "#6B7A8A", Icon: Star   },
    GOLD:    { label: "Gold",    heroGradient: "from-yellow-950 via-yellow-800 to-amber-600", activeBg: "#B8901C", accentHex: "#B8901C", Icon: Crown  },
    DIAMOND: { label: "Diamond", heroGradient: "from-teal-950 via-teal-800 to-emerald-600",  activeBg: "#1D9E75", accentHex: "#1D9E75", Icon: Gem    },
};

type Zone = "promotion" | "safe" | "relegation";

function getZones(n: number, tierIndex: number): Zone[] {
    if (n === 0) return [];
    const promotionCount = tierIndex < TIERS.length - 1 ? Math.max(1, Math.floor(n * 0.25)) : 0;
    const relegationCount = tierIndex > 0                ? Math.max(1, Math.ceil(n * 0.15))  : 0;
    return Array.from({ length: n }, (_, i) => {
        const rank = i + 1;
        if (promotionCount > 0 && rank <= promotionCount)      return "promotion";
        if (relegationCount > 0 && rank > n - relegationCount) return "relegation";
        return "safe";
    });
}

function ZoneDivider({ type, toTierLabel }: { type: "promotion" | "relegation"; toTierLabel: string }) {
    const isUp = type === "promotion";
    return (
        <li className={`flex items-center gap-3 px-5 py-2 ${isUp ? "bg-emerald-50 border-y border-emerald-100" : "bg-red-50 border-y border-red-100"}`}>
            <div className={`flex-1 h-px ${isUp ? "bg-emerald-200" : "bg-red-200"}`} />
            <span className={`text-[10px] font-extrabold uppercase tracking-[0.18em] whitespace-nowrap flex items-center gap-1 ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                {isUp ? "▲" : "▼"} {isUp ? `Naik ke ${toTierLabel}` : `Turun ke ${toTierLabel}`}
            </span>
            <div className={`flex-1 h-px ${isUp ? "bg-emerald-200" : "bg-red-200"}`} />
        </li>
    );
}

function RankCircle({ rank }: { rank: number }) {
    const base = "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold";
    if (rank === 1) return <div className={`${base} bg-amber-100 text-amber-700 border-2 border-amber-300`}><Crown className="w-4 h-4" /></div>;
    if (rank === 2) return <div className={`${base} bg-slate-100 text-slate-500 border-2 border-slate-300`}><Award className="w-4 h-4" /></div>;
    if (rank === 3) return <div className={`${base} bg-orange-100 text-orange-600 border-2 border-orange-300`}><Award className="w-4 h-4" /></div>;
    return <div className={`${base} bg-yomu-background text-yomu-text-secondary`}>{rank}</div>;
}

function SkeletonRow() {
    return (
        <li className="flex items-center gap-4 px-5 py-4 border-b border-yomu-border last:border-0">
            <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 h-4 rounded-md bg-muted animate-pulse" />
            <div className="w-20 h-4 rounded-md bg-muted animate-pulse" />
        </li>
    );
}

export default function LeaderboardPage() {
    const searchParams = useSearchParams();
    const initialTier = (TIERS.includes(searchParams.get("tier") as ClanTier)
        ? searchParams.get("tier") as ClanTier
        : "BRONZE");

    const [tier, setTier] = useState<ClanTier>(initialTier);
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    const loadData = async (t: ClanTier) => {
        setLoading(true);
        setError(null);
        try {
            setEntries(await getLeaderboard(t));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memuat leaderboard");
        } finally {
            setLoading(false);
        }
    };

    if (!initialized) {
        setInitialized(true);
        loadData(initialTier);
    }

    const handleTierChange = (t: ClanTier) => { setTier(t); loadData(t); };

    const config    = tierConfig[tier];
    const TierIcon  = config.Icon;
    const tierIndex = TIERS.indexOf(tier);
    const zones     = getZones(entries.length, tierIndex);
    const nextTier  = TIERS[tierIndex + 1];
    const prevTier  = TIERS[tierIndex - 1];

    return (
        <div className="min-h-screen bg-yomu-background">
            <div className={`bg-gradient-to-br ${config.heroGradient} text-white`}>
                <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <TierIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-white/75 text-sm font-medium uppercase tracking-widest">
                            Liga {config.label}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2 leading-tight">Leaderboard</h1>

                    <div className="flex flex-wrap gap-2 mt-6">
                        {TIERS.map((t) => {
                            const isActive = tier === t;
                            const cfg = tierConfig[t];
                            const Icon = cfg.Icon;
                            return (
                                <button
                                    key={t}
                                    onClick={() => handleTierChange(t)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? "bg-white text-gray-800 shadow-lg shadow-black/20"
                                            : "bg-white/15 text-white/80 hover:bg-white/25 hover:text-white backdrop-blur-sm"
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-6 pb-10 space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="bg-yomu-surface rounded-2xl border border-yomu-border overflow-hidden shadow-sm">
                    {!loading && entries.length > 0 && (
                        <div className="flex items-center gap-4 px-5 py-2.5 bg-yomu-background border-b border-yomu-border">
                            <div className="w-9 shrink-0" />
                            <div className="flex-1 text-[10px] font-extrabold text-yomu-text-secondary uppercase tracking-[0.15em]">Clan</div>
                            <div className="text-[10px] font-extrabold text-yomu-text-secondary uppercase tracking-[0.15em]">Skor</div>
                        </div>
                    )}

                    {loading && (
                        <ol>{[0, 1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}</ol>
                    )}

                    {!loading && entries.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                 style={{ backgroundColor: `${config.accentHex}14` }}>
                                <Users className="w-8 h-8" style={{ color: config.accentHex }} />
                            </div>
                            <div>
                                <p className="font-semibold text-yomu-foreground mb-1">Belum ada clan di liga {config.label}</p>
                                <p className="text-sm text-yomu-text-secondary max-w-xs leading-relaxed">
                                    {tierIndex === 0
                                        ? "Buat clan dan mulai membaca untuk masuk peringkat."
                                        : `Clan naik ke sini dari liga ${tierConfig[prevTier].label} saat masuk 25% teratas.`}
                                </p>
                            </div>
                        </div>
                    )}

                    {!loading && entries.length > 0 && (
                        <ol>
                            {entries.map((entry, i) => {
                                const zone     = zones[i];
                                const prevZone = i > 0 ? zones[i - 1] : null;

                                const showPromoDivider = zone !== "promotion" && prevZone === "promotion" && nextTier;
                                const showReleDivider  = zone === "relegation" && prevZone !== "relegation" && prevTier;

                                const rowBg =
                                    zone === "promotion"  ? "bg-emerald-50/60" :
                                    zone === "relegation" ? "bg-red-50/50"     : "";

                                const scoreColor =
                                    zone === "promotion"  ? "text-emerald-700" :
                                    zone === "relegation" ? "text-red-500"     :
                                    "text-yomu-text-secondary";

                                return (
                                    <>
                                        {showPromoDivider && (
                                            <ZoneDivider key={`promo-div-${entry.clanId}`} type="promotion" toTierLabel={tierConfig[nextTier].label} />
                                        )}
                                        {showReleDivider && (
                                            <ZoneDivider key={`rele-div-${entry.clanId}`} type="relegation" toTierLabel={tierConfig[prevTier].label} />
                                        )}
                                        <li
                                            key={entry.clanId}
                                            className={`border-b border-yomu-border last:border-0 ${rowBg}`}
                                        >
                                            <Link
                                                href={`/social/clan/${entry.clanId}`}
                                                className="flex items-center gap-4 px-5 py-3.5 hover:brightness-95 transition-all duration-100 cursor-pointer"
                                            >
                                                <RankCircle rank={entry.rank} />
                                                <span className="flex-1 flex items-center gap-2 min-w-0">
                                                    <span className="text-sm font-medium text-yomu-foreground truncate">{entry.clanName}</span>
                                                    <ModifierBadges buffActive={entry.buffActive} debuffActive={entry.debuffActive} size="sm" showLabel={false} />
                                                </span>
                                                <span className={`text-sm tabular-nums font-semibold ${scoreColor}`}>
                                                    {entry.score.toLocaleString("id-ID")}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-yomu-text-secondary/40 shrink-0" />
                                            </Link>
                                        </li>
                                    </>
                                );
                            })}
                        </ol>
                    )}
                </div>

                {!loading && entries.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-4 py-1 text-xs text-yomu-text-secondary">
                        {nextTier && (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-sm bg-emerald-200 inline-block" />
                                Top 25% naik ke liga {tierConfig[nextTier].label}
                            </span>
                        )}
                        {prevTier && (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-sm bg-red-200 inline-block" />
                                Bottom 15% turun ke liga {tierConfig[prevTier].label}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

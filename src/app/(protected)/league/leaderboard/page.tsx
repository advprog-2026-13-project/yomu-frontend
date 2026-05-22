"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { LeaderboardEntry, ClanTier } from "@/src/modules/social/types";
import { getLeaderboard } from "@/src/modules/social/api";

const TIERS: ClanTier[] = ["BRONZE", "SILVER", "GOLD", "DIAMOND"];
const tierColors: Record<string, string> = {
    BRONZE: "#CD7F32",
    SILVER: "#C0C0C0",
    GOLD: "#FFD700",
    DIAMOND: "#B9F2FF",
};
const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
    const [tier, setTier] = useState<ClanTier>("BRONZE");
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    const loadData = async (selectedTier: ClanTier) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getLeaderboard(selectedTier);
            setEntries(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load leaderboard");
        } finally {
            setLoading(false);
        }
    };

    const handleTierChange = (selectedTier: ClanTier) => {
        setTier(selectedTier);
        loadData(selectedTier);
    };

    if (!initialized) {
        setInitialized(true);
        loadData("BRONZE");
    }

    return (
        <div className="yomu-page-container space-y-6">
            <div>
                <h1 className="yomu-heading-1">
                    <Trophy className="h-6 w-6 text-yomu-accent" />
                    Leaderboard
                </h1>
                <p className="yomu-text-muted">Clan rankings by tier</p>
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            {/* Tier filter */}
            <div className="flex gap-2">
                {TIERS.map((t) => (
                    <button
                        key={t}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            tier === t
                                ? "text-white"
                                : "bg-yomu-surface border border-yomu-border text-yomu-text-secondary hover:bg-yomu-background"
                        }`}
                        style={tier === t ? { backgroundColor: tierColors[t], color: t === "DIAMOND" ? "#085041" : "#FFFFFF" } : {}}
                        onClick={() => handleTierChange(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <Card className="yomu-card">
                <CardHeader>
                    <CardTitle>{tier} Tier</CardTitle>
                    <CardDescription>Ranked clans by score</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && <p className="text-yomu-text-secondary">Loading leaderboard...</p>}

                    {!loading && entries.length === 0 && (
                        <p className="text-yomu-text-secondary text-center py-8">No clans in this tier yet</p>
                    )}

                    {!loading && entries.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-yomu-border">
                                        <th className="text-left py-3 px-4 font-medium text-yomu-text-secondary">Rank</th>
                                        <th className="text-left py-3 px-4 font-medium text-yomu-text-secondary">Clan</th>
                                        <th className="text-right py-3 px-4 font-medium text-yomu-text-secondary">Score</th>
                                        <th className="text-center py-3 px-4 font-medium text-yomu-text-secondary">Tier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry) => (
                                        <tr key={entry.clanId} className="border-b border-yomu-border last:border-0">
                                            <td className="py-3 px-4">
                                                {entry.rank <= 3 ? (
                                                    <span className="text-lg">{medals[entry.rank - 1]}</span>
                                                ) : (
                                                    <span className="text-yomu-text-secondary">#{entry.rank}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-medium">{entry.clanName}</td>
                                            <td className="py-3 px-4 text-right font-mono">{entry.score.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${tierColors[entry.tier]}22`, color: tierColors[entry.tier] }}>
                                                    {entry.tier}
                                                </span>
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

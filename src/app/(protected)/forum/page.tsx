"use client";

import { useEffect, useState, useCallback } from "react";
import {
    MessageSquare,
    BookOpen,
    Search,
    Loader2,
    AlertCircle,
    Users,
    Flame,
    SlidersHorizontal,
    TrendingUp,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchReadings } from "@/src/modules/admin/api";
import { fetchComments } from "@/src/modules/forum/api";
import { ForumReadingCard, ForumEmptyState } from "@/src/modules/forum/components";
import type { Reading } from "@/src/modules/admin/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReadingWithCount extends Reading {
    commentCount: number;
}

type SortMode = "activity" | "newest" | "az";

// ─── Stat Pill ───────────────────────────────────────────────────────────────

function StatPill({
    icon: Icon,
    value,
    label,
    color = "text-white",
}: {
    icon: React.ElementType;
    value: number;
    label: string;
    color?: string;
}) {
    return (
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
            <Icon className={`h-4 w-4 ${color}`} />
            <span className="font-semibold">{value}</span>
            <span className="text-white/80">{label}</span>
        </div>
    );
}

// ─── Sort Button ─────────────────────────────────────────────────────────────

function SortButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${active
                ? "bg-yomu-primary text-white shadow-sm"
                : "bg-yomu-surface border border-yomu-border text-yomu-text-secondary hover:border-yomu-primary hover:text-yomu-primary"
                }`}
        >
            {children}
        </button>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ForumPage() {
    const [readings, setReadings] = useState<ReadingWithCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [sortMode, setSortMode] = useState<SortMode>("activity");

    const loadReadings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchReadings();
            const withCounts = await Promise.all(
                data.map(async (r) => {
                    try {
                        const comments = await fetchComments(r.readingId);
                        const total = comments.reduce(
                            (acc, c) => acc + 1 + (c.replies?.length ?? 0),
                            0
                        );
                        return { ...r, commentCount: total };
                    } catch {
                        return { ...r, commentCount: 0 };
                    }
                })
            );
            setReadings(withCounts);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memuat data bacaan.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadReadings();
    }, [loadReadings]);

    // Filter
    const filtered = readings.filter(
        (r) =>
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.category?.toLowerCase().includes(search.toLowerCase())
    );

    // Sort
    const sorted = [...filtered].sort((a, b) => {
        if (sortMode === "activity") return b.commentCount - a.commentCount;
        if (sortMode === "az") return a.title.localeCompare(b.title);
        return 0; // "newest" — keep server order
    });

    // Stats
    const totalComments = readings.reduce((a, r) => a + r.commentCount, 0);
    const activeThreads = readings.filter((r) => r.commentCount > 0).length;

    return (
        <div className="min-h-screen bg-yomu-background">
            {/* ── Hero Header ─────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-yomu-primary-dark via-yomu-primary to-[#2ab888] text-white">
                <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium uppercase tracking-widest">
                            Komunitas Yomu
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 leading-tight">
                        Forum Diskusi
                    </h1>
                    <p className="text-white/80 text-lg max-w-xl leading-relaxed">
                        Diskusikan bacaan, tanyakan yang belum dipahami, dan bertukar pikiran
                        bersama komunitas literasi Yomu.
                    </p>

                    {/* Stats Row */}
                    {!loading && !error && (
                        <div className="flex flex-wrap gap-3 mt-8">
                            <StatPill
                                icon={BookOpen}
                                value={readings.length}
                                label="Bacaan"
                                color="text-yomu-accent"
                            />
                            <StatPill
                                icon={Flame}
                                value={activeThreads}
                                label="Thread Aktif"
                                color="text-orange-300"
                            />
                            <StatPill
                                icon={Users}
                                value={totalComments}
                                label="Komentar"
                                color="text-white"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Search + Sort Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-yomu-text-secondary pointer-events-none" />
                        <Input
                            id="forum-search"
                            type="text"
                            placeholder="Cari bacaan atau kategori..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-11 bg-yomu-surface border-yomu-border rounded-xl text-sm focus:border-yomu-primary"
                        />
                    </div>

                    {/* Sort Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <SlidersHorizontal className="h-4 w-4 text-yomu-text-secondary" />
                        <SortButton
                            active={sortMode === "activity"}
                            onClick={() => setSortMode("activity")}
                        >
                            <TrendingUp className="h-3.5 w-3.5" />
                            Teraktif
                        </SortButton>
                        <SortButton
                            active={sortMode === "newest"}
                            onClick={() => setSortMode("newest")}
                        >
                            <Clock className="h-3.5 w-3.5" />
                            Terbaru
                        </SortButton>
                        <SortButton
                            active={sortMode === "az"}
                            onClick={() => setSortMode("az")}
                        >
                            A–Z
                        </SortButton>
                    </div>
                </div>

                {/* ── Loading ─────────────────────────────────────────────── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-yomu-primary-light flex items-center justify-center">
                                <MessageSquare className="h-7 w-7 text-yomu-primary" />
                            </div>
                            <Loader2 className="absolute -top-1 -right-1 h-5 w-5 text-yomu-primary animate-spin" />
                        </div>
                        <p className="text-yomu-text-secondary text-sm">
                            Memuat daftar bacaan...
                        </p>
                    </div>
                )}

                {/* ── Error ───────────────────────────────────────────────── */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="p-4 bg-red-50 rounded-full">
                            <AlertCircle className="h-8 w-8 text-yomu-destructive" />
                        </div>
                        <p className="text-yomu-destructive font-medium text-sm">{error}</p>
                        <Button
                            onClick={loadReadings}
                            variant="outline"
                            className="border-yomu-border text-yomu-primary hover:bg-yomu-primary-light"
                        >
                            Coba Lagi
                        </Button>
                    </div>
                )}

                {/* ── Reading Cards ────────────────────────────────────────── */}
                {!loading && !error && (
                    <>
                        {/* Results label */}
                        {search && (
                            <p className="text-sm text-yomu-text-secondary mb-4">
                                Menampilkan{" "}
                                <span className="font-semibold text-yomu-foreground">
                                    {sorted.length}
                                </span>{" "}
                                hasil untuk &ldquo;{search}&rdquo;
                            </p>
                        )}

                        {sorted.length === 0 ? (
                            <ForumEmptyState hasSearch={search.length > 0} />
                        ) : (
                            <div className="space-y-3">
                                {sorted.map((reading, idx) => (
                                    <ForumReadingCard
                                        key={reading.readingId}
                                        readingId={reading.readingId}
                                        title={reading.title}
                                        category={reading.category}
                                        commentCount={reading.commentCount}
                                        rank={idx + 1}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

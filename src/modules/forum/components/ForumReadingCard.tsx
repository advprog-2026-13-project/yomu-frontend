import Link from "next/link";
import { MessageSquare, Flame, Hash, ChevronRight, BookOpen } from "lucide-react";

const CATEGORY_STYLES: Record<string, string> = {
    SAINS: "bg-blue-100 text-blue-700 border-blue-200",
    TEKNOLOGI: "bg-purple-100 text-purple-700 border-purple-200",
    SEJARAH: "bg-amber-100 text-amber-700 border-amber-200",
    SOSIAL: "bg-green-100 text-green-700 border-green-200",
    BUDAYA: "bg-pink-100 text-pink-700 border-pink-200",
    KESEHATAN: "bg-teal-100 text-teal-700 border-teal-200",
    LINGKUNGAN: "bg-lime-100 text-lime-700 border-lime-200",
    POLITIK: "bg-orange-100 text-orange-700 border-orange-200",
};

export function CategoryBadge({ category }: { category: string }) {
    const color =
        CATEGORY_STYLES[category?.toUpperCase()] ??
        "bg-gray-100 text-gray-600 border-gray-200";
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}
        >
            <Hash className="h-2.5 w-2.5" />
            {category}
        </span>
    );
}

interface ForumReadingCardProps {
    readingId: string;
    title: string;
    category?: string;
    commentCount: number;
    rank: number;
}

export function ForumReadingCard({
    readingId,
    title,
    category,
    commentCount,
    rank,
}: ForumReadingCardProps) {
    const isTop3 = rank <= 3 && commentCount > 0;
    const rankStyle =
        rank === 1 && commentCount > 0
            ? "bg-amber-100 text-amber-600 ring-1 ring-amber-300"
            : rank === 2 && commentCount > 0
            ? "bg-slate-100 text-slate-500 ring-1 ring-slate-300"
            : rank === 3 && commentCount > 0
            ? "bg-orange-100 text-orange-500 ring-1 ring-orange-300"
            : "bg-yomu-primary-light text-yomu-primary";

    return (
        <Link
            href={`/forum/${readingId}`}
            id={`forum-reading-${readingId}`}
            className="group flex items-center gap-4 bg-yomu-surface border border-yomu-border rounded-2xl px-5 py-4 hover:border-yomu-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
            {/* Rank Badge */}
            <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${rankStyle}`}
            >
                {isTop3 ? (
                    rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"
                ) : (
                    rank
                )}
            </div>

            {/* Reading Info */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {category && <CategoryBadge category={category} />}
                    {commentCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yomu-primary-light text-yomu-primary border border-yomu-primary/20">
                            <Flame className="h-2.5 w-2.5" />
                            Aktif
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-yomu-text-secondary border border-yomu-border">
                            Belum ada diskusi
                        </span>
                    )}
                </div>
                <h2 className="font-semibold text-yomu-foreground text-base leading-snug group-hover:text-yomu-primary transition-colors truncate">
                    {title}
                </h2>
            </div>

            {/* Comment Count */}
            <div className="flex-shrink-0 flex items-center gap-3 text-yomu-text-secondary">
                <div className="flex flex-col items-center min-w-[48px]">
                    <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-bold text-yomu-foreground text-sm">
                            {commentCount}
                        </span>
                    </div>
                    <span className="text-xs">komentar</span>
                </div>
                <ChevronRight className="h-5 w-5 text-yomu-border group-hover:text-yomu-primary group-hover:translate-x-0.5 transition-all" />
            </div>
        </Link>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function ForumEmptyState({ hasSearch }: { hasSearch: boolean }) {
    return (
        <div className="text-center py-20">
            <div className="p-5 bg-yomu-primary-light rounded-full inline-block mb-4">
                {hasSearch ? (
                    <Hash className="h-8 w-8 text-yomu-primary" />
                ) : (
                    <BookOpen className="h-8 w-8 text-yomu-primary" />
                )}
            </div>
            <p className="text-yomu-foreground font-semibold text-lg">
                {hasSearch ? "Tidak ada bacaan ditemukan" : "Belum ada bacaan"}
            </p>
            <p className="text-yomu-text-secondary mt-1 text-sm">
                {hasSearch
                    ? "Coba kata kunci atau kategori yang berbeda."
                    : "Bacaan akan muncul di sini setelah ditambahkan."}
            </p>
        </div>
    );
}

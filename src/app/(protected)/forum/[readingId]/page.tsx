"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    MessageSquare,
    BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchComments, postComment } from "@/src/modules/forum/api";
import { fetchReadings } from "@/src/modules/admin/api";
import { useAuth } from "@/src/modules/auth";
import { Avatar, CommentCard, CommentInput } from "@/src/modules/forum/components";
import type { CommentView } from "@/src/modules/forum/types";
import type { Reading } from "@/src/modules/admin/types";
// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ForumThreadPage() {
    const { readingId } = useParams<{ readingId: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = user?.role?.toUpperCase() === "ADMIN";

    const [comments, setComments] = useState<CommentView[]>([]);
    const [reading, setReading] = useState<Reading | null>(null);
    const [loadingComments, setLoadingComments] = useState(true);
    const [postingComment, setPostingComment] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadComments = useCallback(async () => {
        setLoadingComments(true);
        setError(null);
        try {
            const data = await fetchComments(readingId);
            setComments(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Gagal memuat komentar.");
        } finally {
            setLoadingComments(false);
        }
    }, [readingId]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    // Load reading info for display
    useEffect(() => {
        fetchReadings()
            .then((all) => {
                const found = all.find((r) => r.readingId === readingId);
                setReading(found ?? null);
            })
            .catch(() => {});
    }, [readingId]);

    async function handlePostComment(content: string) {
        setPostingComment(true);
        try {
            await postComment(readingId, { content });
            await loadComments();
        } finally {
            setPostingComment(false);
        }
    }

    const totalCount = comments.reduce(
        (acc, c) => acc + 1 + (c.replies?.length ?? 0),
        0
    );

    return (
        <div className="min-h-screen bg-yomu-background">
            {/* Sticky top bar */}
            <div className="bg-yomu-surface border-b border-yomu-border sticky top-16 z-40">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Button
                        id="back-to-forum"
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-xl h-9 w-9 text-yomu-text-secondary hover:text-yomu-primary hover:bg-yomu-primary-light"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <Link
                                href="/forum"
                                className="text-xs text-yomu-text-secondary hover:text-yomu-primary transition-colors"
                            >
                                Forum
                            </Link>
                            <span className="text-yomu-text-secondary text-xs">/</span>
                            <span className="text-xs text-yomu-primary font-medium truncate">
                                {reading?.title ?? "Memuat..."}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Reading Info Card */}
                {reading && (
                    <div className="bg-gradient-to-br from-yomu-primary-dark to-yomu-primary text-white rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/20 rounded-xl flex-shrink-0">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {reading.category && (
                                        <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            {reading.category}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-xl font-serif font-bold leading-snug">
                                    {reading.title}
                                </h1>
                                <div className="flex items-center gap-3 mt-3 text-white/70 text-sm">
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        {totalCount} komentar
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* New Comment Box */}
                <div className="bg-yomu-surface border border-yomu-border rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        {user && <Avatar name={user.displayName} />}
                        <span className="text-sm font-medium text-yomu-foreground">
                            Tulis komentar sebagai{" "}
                            <span className="text-yomu-primary">{user?.displayName}</span>
                        </span>
                    </div>
                    <CommentInput
                        id="new-comment-input"
                        placeholder="Bagikan pendapatmu tentang bacaan ini... (Enter untuk kirim)"
                        onSubmit={handlePostComment}
                        loading={postingComment}
                    />
                </div>

                {/* Comments Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-yomu-foreground flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-yomu-primary" />
                            {loadingComments ? "Memuat..." : `${totalCount} Komentar`}
                        </h2>
                        {!loadingComments && comments.length > 0 && (
                            <button
                                onClick={loadComments}
                                className="text-xs text-yomu-text-secondary hover:text-yomu-primary transition-colors"
                            >
                                Refresh
                            </button>
                        )}
                    </div>

                    {/* Loading */}
                    {loadingComments && (
                        <div className="flex flex-col items-center py-12 gap-3">
                            <Loader2 className="h-8 w-8 text-yomu-primary animate-spin" />
                            <p className="text-sm text-yomu-text-secondary">
                                Memuat komentar...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex flex-col items-center py-10 gap-3">
                            <AlertCircle className="h-7 w-7 text-yomu-destructive" />
                            <p className="text-sm text-yomu-destructive">{error}</p>
                            <Button
                                onClick={loadComments}
                                variant="outline"
                                size="sm"
                                className="border-yomu-border hover:bg-yomu-primary-light text-yomu-primary"
                            >
                                Coba Lagi
                            </Button>
                        </div>
                    )}

                    {/* Empty */}
                    {!loadingComments && !error && comments.length === 0 && (
                        <div className="text-center py-16">
                            <div className="p-5 bg-yomu-primary-light rounded-full inline-block mb-4">
                                <MessageSquare className="h-8 w-8 text-yomu-primary" />
                            </div>
                            <p className="font-semibold text-yomu-foreground">
                                Belum ada komentar
                            </p>
                            <p className="text-sm text-yomu-text-secondary mt-1">
                                Jadilah yang pertama berdiskusi!
                            </p>
                        </div>
                    )}

                    {/* Comments list */}
                    {!loadingComments && !error && comments.length > 0 && (
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <CommentCard
                                    key={comment.id}
                                    comment={comment}
                                    currentUserId={user?.id}
                                    isAdmin={isAdmin}
                                    readingId={readingId}
                                    onRefresh={loadComments}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

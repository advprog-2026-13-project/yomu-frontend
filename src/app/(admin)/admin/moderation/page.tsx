"use client";

import { useState } from "react";
import { Trash2, Loader2, MessageSquare, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchAllComments, deleteForumComment } from "@/src/modules/admin/api";
import type { CommentView } from "@/src/modules/forum/types";

export default function ForumPage() {
    const [comments, setComments] = useState<CommentView[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    const loadComments = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const data = await fetchAllComments();
            setComments(data);
        } catch (err) {
            setIsError(true);
            setMessage(err instanceof Error ? err.message : "Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    if (!initialized) {
        setInitialized(true);
        loadComments();
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this comment permanently?")) return;

        setDeleting(id);
        setMessage(null);
        try {
            await deleteForumComment(id);
            setComments((prev) => prev.filter((c) => c.id !== id));
            setMessage("Comment deleted successfully");
            setIsError(false);
        } catch (err) {
            setIsError(true);
            setMessage(err instanceof Error ? err.message : "Failed to delete comment");
        } finally {
            setDeleting(null);
        }
    };

    const filtered = search.trim()
        ? comments.filter(
              (c) =>
                  c.authorName?.toLowerCase().includes(search.toLowerCase()) ||
                  c.content?.toLowerCase().includes(search.toLowerCase()) ||
                  c.id.toLowerCase().includes(search.toLowerCase())
          )
        : comments;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Forum Moderation</h2>
                    <p className="text-muted-foreground">Browse and moderate all forum comments</p>
                </div>
                <Button variant="outline" onClick={loadComments} disabled={loading}>
                    <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {message && (
                <Alert variant={isError ? "destructive" : "default"}>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by author, content, or comment ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center py-16 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading comments...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
                    <MessageSquare className="h-10 w-10" />
                    <p>{search ? "No comments match your search" : "No comments found"}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Showing {filtered.length} of {comments.length} comment{comments.length !== 1 ? "s" : ""}
                    </p>
                    {filtered.map((comment) => (
                        <Card
                            key={comment.id}
                            className={comment.deleted ? "opacity-60" : ""}
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm">
                                                {comment.authorName || "Unknown"}
                                            </span>
                                            {comment.deleted && (
                                                <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">
                                                    Deleted
                                                </span>
                                            )}
                                            {comment.parentId && (
                                                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                                    Reply
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {comment.deleted ? "[This comment has been deleted]" : (comment.content || "")}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>ID: {comment.id.slice(0, 8)}...</span>
                                            <span>
                                                {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={deleting === comment.id}
                                    >
                                        {deleting === comment.id ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

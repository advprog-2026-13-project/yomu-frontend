"use client";

import { useState } from "react";
import { Check, CornerDownRight } from "lucide-react";
import { Avatar } from "./Avatar";
import { ReactionBar } from "./ReactionBar";
import { CommentInput } from "./CommentInput";
import { CommentMenu } from "./CommentMenu";
import {
    replyToComment,
    editComment,
    deleteComment,
    deleteCommentAsAdmin,
    toggleReaction,
} from "../api";
import type { CommentView, ReactionType } from "../types";
import { timeAgo } from "../utils";

// ─── CommentCard ─────────────────────────────────────────────────────────────

interface CommentCardProps {
    comment: CommentView;
    currentUserId: string | undefined;
    isAdmin?: boolean;
    onRefresh: () => void;
    depth?: number;
}

export function CommentCard({
    comment,
    currentUserId,
    isAdmin = false,
    onRefresh,
    depth = 0,
}: CommentCardProps) {
    const [replying, setReplying] = useState(false);
    const [editing, setEditing] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [localReactions, setLocalReactions] = useState(comment.reactionCounts);

    const isOwner = currentUserId && comment.authorId === currentUserId;
    const canEdit = Boolean(isOwner);
    const canDelete = Boolean(isOwner || isAdmin);
    const deleteLabel = isAdmin && !isOwner ? "Hapus (Moderasi)" : "Hapus";

    async function handleReply(content: string) {
        setLoadingAction(true);
        try {
            await replyToComment(comment.id, { content });
            setReplying(false);
            onRefresh();
        } finally {
            setLoadingAction(false);
        }
    }

    async function handleEdit(newContent: string) {
        setLoadingAction(true);
        setEditError(null);
        try {
            await editComment(comment.id, { newContent });
            setEditing(false);
            onRefresh();
        } catch (e) {
            setEditError(e instanceof Error ? e.message : "Gagal mengedit.");
        } finally {
            setLoadingAction(false);
        }
    }

    async function handleDelete() {
        const confirmLabel = isAdmin && !isOwner
            ? "Hapus komentar ini sebagai admin?"
            : "Hapus komentar ini?";
        if (!confirm(confirmLabel)) return;
        setLoadingAction(true);
        try {
            if (isAdmin && !isOwner) {
                await deleteCommentAsAdmin(comment.id);
            } else {
                await deleteComment(comment.id);
            }
            onRefresh();
        } finally {
            setLoadingAction(false);
        }
    }

    async function handleReact(commentId: string, type: ReactionType) {
        setLocalReactions((prev) => {
            const current = prev[type] ?? 0;
            return { ...prev, [type]: current > 0 ? current - 1 : current + 1 };
        });
        try {
            await toggleReaction(commentId, { type });
        } catch {
            setLocalReactions(comment.reactionCounts);
        }
    }

    // ── Deleted state ─────────────────────────────────────────────────────────
    if (comment.deleted) {
        return (
            <div className={depth > 0 ? "ml-8 border-l-2 border-yomu-border pl-4" : ""}>
                <div className="py-3 px-4 rounded-xl bg-muted/60 border border-dashed border-yomu-border">
                    <p className="text-sm text-yomu-text-secondary italic">
                        [Komentar ini telah dihapus]
                    </p>
                </div>
                {comment.replies?.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {comment.replies.map((reply) => (
                            <CommentCard
                                key={reply.id}
                                comment={reply}
                                currentUserId={currentUserId}
                                isAdmin={isAdmin}
                                onRefresh={onRefresh}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── Normal state ──────────────────────────────────────────────────────────
    return (
        <div className={depth > 0 ? "ml-8 pl-4 border-l-2 border-yomu-primary/20" : ""}>
            <div
                className={`bg-yomu-surface border rounded-2xl p-4 transition-all duration-200 ${
                    loadingAction
                        ? "opacity-60 pointer-events-none"
                        : "border-yomu-border hover:border-yomu-primary/30 hover:shadow-sm"
                }`}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                        <Avatar name={comment.authorName} size={depth > 0 ? "sm" : "md"} />
                        <div>
                            <span className="font-semibold text-sm text-yomu-foreground">
                                {comment.authorName}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-yomu-text-secondary">
                                <span>{timeAgo(comment.createdAt)}</span>
                                {comment.editedAt && (
                                    <>
                                        <span>·</span>
                                        <span className="flex items-center gap-0.5">
                                            <Check className="h-3 w-3" />
                                            diedit
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {(canEdit || canDelete) && !editing && (
                        <CommentMenu
                            commentId={comment.id}
                            onEdit={canEdit ? () => setEditing(true) : undefined}
                            onDelete={canDelete ? handleDelete : undefined}
                            allowEdit={canEdit}
                            allowDelete={canDelete}
                            deleteLabel={deleteLabel}
                        />
                    )}
                </div>

                {/* Content / Edit Mode */}
                {editing ? (
                    <div className="mb-3">
                        {editError && (
                            <p className="text-xs text-yomu-destructive mb-2">{editError}</p>
                        )}
                        <CommentInput
                            id={`edit-input-${comment.id}`}
                            placeholder="Edit komentar..."
                            onSubmit={handleEdit}
                            onCancel={() => setEditing(false)}
                            loading={loadingAction}
                            defaultValue={comment.content}
                            autoFocus
                        />
                    </div>
                ) : (
                    <p className="text-sm text-yomu-foreground leading-relaxed mb-3 whitespace-pre-wrap">
                        {comment.content}
                    </p>
                )}

                {/* Actions */}
                {!editing && (
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <ReactionBar
                            commentId={comment.id}
                            reactionCounts={localReactions}
                            onReact={handleReact}
                        />
                        {depth === 0 && (
                            <button
                                id={`reply-btn-${comment.id}`}
                                onClick={() => setReplying((r) => !r)}
                                className="flex items-center gap-1.5 text-xs text-yomu-text-secondary hover:text-yomu-primary font-medium transition-colors"
                            >
                                <CornerDownRight className="h-3.5 w-3.5" />
                                {replying
                                    ? "Batal Balas"
                                    : `Balas${comment.replies?.length ? ` (${comment.replies.length})` : ""}`}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Reply Input */}
            {replying && depth === 0 && (
                <div className="mt-2 ml-4 pl-4 border-l-2 border-yomu-primary/20">
                    <CommentInput
                        id={`reply-input-${comment.id}`}
                        placeholder={`Balas ${comment.authorName}...`}
                        onSubmit={handleReply}
                        onCancel={() => setReplying(false)}
                        loading={loadingAction}
                        autoFocus
                    />
                </div>
            )}

            {/* Nested Replies */}
            {comment.replies?.length > 0 && (
                <div className="mt-2 space-y-2">
                    {comment.replies.map((reply) => (
                        <CommentCard
                            key={reply.id}
                            comment={reply}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                            onRefresh={onRefresh}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

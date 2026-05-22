export type ReactionType =
    | "UPVOTE"
    | "DOWNVOTE"
    | "EMOJI_LIKE"
    | "EMOJI_LAUGH"
    | "EMOJI_WOW"
    | "EMOJI_SAD"
    | "EMOJI_ANGRY";

export interface CommentView {
    id: string;
    readingId: string;
    authorId: string;
    authorName: string;
    parentId: string | null;
    content: string;
    deleted: boolean;
    createdAt: string; // ISO string (Instant)
    editedAt: string | null;
    reactionCounts: Partial<Record<ReactionType, number>>;
    replies: CommentView[];
}

export interface PostCommentInput {
    content: string;
}

export interface ReplyInput {
    content: string;
}

export interface EditCommentInput {
    newContent: string;
}

export interface ReactInput {
    type: ReactionType;
}

export const REACTION_META: Record<ReactionType, { emoji: string; label: string }> = {
    UPVOTE: { emoji: "👍", label: "Suka" },
    DOWNVOTE: { emoji: "👎", label: "Tidak Suka" },
    EMOJI_LIKE: { emoji: "❤️", label: "Love" },
    EMOJI_LAUGH: { emoji: "😂", label: "Haha" },
    EMOJI_WOW: { emoji: "😮", label: "Wow" },
    EMOJI_SAD: { emoji: "😢", label: "Sedih" },
    EMOJI_ANGRY: { emoji: "😡", label: "Marah" },
};

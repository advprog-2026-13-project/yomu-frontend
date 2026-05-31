import { authHeaders, request } from "../api";
import type {
    CommentView,
    PostCommentInput,
    ReplyInput,
    EditCommentInput,
    ReactInput,
} from "./types";

// GET /api/forums/{readingId}/comments
export async function fetchComments(readingId: string): Promise<CommentView[]> {
    return request<CommentView[]>(`/api/forums/${readingId}/comments`, {
        headers: authHeaders(),
    });
}

// POST /api/forums/{readingId}/comments
export async function postComment(
    readingId: string,
    input: PostCommentInput
): Promise<CommentView> {
    return request<CommentView>(`/api/forums/${readingId}/comments`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

// POST /api/forums/comments/{id}/replies
export async function replyToComment(
    commentId: string,
    input: ReplyInput
): Promise<CommentView> {
    return request<CommentView>(`/api/forums/comments/${commentId}/replies`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

// PUT /api/forums/comments/{id}
export async function editComment(
    commentId: string,
    input: EditCommentInput
): Promise<void> {
    return request<void>(`/api/forums/comments/${commentId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

// DELETE /api/forums/comments/{id}
export async function deleteComment(commentId: string): Promise<void> {
    return request<void>(`/api/forums/comments/${commentId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// DELETE /api/admin/forums/comments/{id}
export async function deleteCommentAsAdmin(commentId: string): Promise<void> {
    return request<void>(`/api/admin/forums/comments/${commentId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
}

// POST /api/forums/comments/{id}/reactions
export async function toggleReaction(
    commentId: string,
    input: ReactInput
): Promise<void> {
    return request<void>(`/api/forums/comments/${commentId}/reactions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(input),
    });
}

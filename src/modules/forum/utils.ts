import type { CommentView } from "./types";

export function timeAgo(isoString: string): string {
    const date = new Date(isoString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "baru saja";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari lalu`;
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function countComments(comments: CommentView[]): number {
    return comments.reduce(
        (total, comment) => total + 1 + countComments(comment.replies ?? []),
        0
    );
}

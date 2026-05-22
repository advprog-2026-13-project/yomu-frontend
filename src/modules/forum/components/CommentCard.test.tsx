import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { CommentCard } from "./CommentCard";
import type { CommentView } from "../types";
import * as forumApi from "../api";

vi.mock("../api", () => ({
  replyToComment: vi.fn(),
  editComment: vi.fn(),
  deleteComment: vi.fn(),
  deleteCommentAsAdmin: vi.fn(),
  toggleReaction: vi.fn(),
}));

const baseComment: CommentView = {
  id: "c1",
  readingId: "r1",
  authorId: "u1",
  authorName: "Jane Doe",
  parentId: null,
  content: "Hello",
  deleted: false,
  createdAt: "2026-05-22T10:00:00.000Z",
  editedAt: null,
  reactionCounts: { UPVOTE: 1 },
  replies: [],
};

describe("CommentCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders deleted placeholder", () => {
    render(
      <CommentCard
        comment={{ ...baseComment, deleted: true }}
        currentUserId="u1"
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText("[Komentar ini telah dihapus]")).toBeInTheDocument();
  });

  it("submits a reply and refreshes", async () => {
    vi.mocked(forumApi.replyToComment).mockResolvedValue(baseComment);
    const onRefresh = vi.fn();
    render(
      <CommentCard
        comment={baseComment}
        currentUserId="u1"
        onRefresh={onRefresh}
      />
    );

    fireEvent.click(screen.getByText("Balas"));

    const textarea = screen.getByPlaceholderText("Balas Jane Doe...");
    fireEvent.change(textarea, { target: { value: "Hi" } });

    const form = textarea.closest("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(forumApi.replyToComment).toHaveBeenCalledWith("c1", { content: "Hi" });
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it("edits a comment and refreshes", async () => {
    vi.mocked(forumApi.editComment).mockResolvedValue(undefined);
    const onRefresh = vi.fn();
    const { container } = render(
      <CommentCard
        comment={baseComment}
        currentUserId="u1"
        onRefresh={onRefresh}
      />
    );

    const menuButton = container.querySelector("#comment-menu-c1");
    if (!menuButton) throw new Error("Menu button not found");

    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText("Edit"));

    const textarea = screen.getByPlaceholderText("Edit komentar...");
    fireEvent.change(textarea, { target: { value: "Updated" } });

    const form = textarea.closest("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(forumApi.editComment).toHaveBeenCalledWith("c1", { newContent: "Updated" });
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it("deletes as admin when not owner", async () => {
    vi.mocked(forumApi.deleteCommentAsAdmin).mockResolvedValue(undefined);
    const onRefresh = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { container } = render(
      <CommentCard
        comment={baseComment}
        currentUserId="u2"
        isAdmin
        onRefresh={onRefresh}
      />
    );

    const menuButton = container.querySelector("#comment-menu-c1");
    if (!menuButton) throw new Error("Menu button not found");

    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText("Hapus (Moderasi)"));

    await waitFor(() => {
      expect(forumApi.deleteCommentAsAdmin).toHaveBeenCalledWith("c1");
      expect(onRefresh).toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
  });

  it("toggles reactions when clicking existing reaction", async () => {
    vi.mocked(forumApi.toggleReaction).mockResolvedValue(undefined);
    render(
      <CommentCard
        comment={baseComment}
        currentUserId="u1"
        onRefresh={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTitle("Suka"));

    await waitFor(() => {
      expect(forumApi.toggleReaction).toHaveBeenCalledWith("c1", { type: "UPVOTE" });
    });
  });
});

import { describe, it, expect, afterEach, vi } from "vitest";
import { timeAgo, countComments } from "./utils";
import type { CommentView } from "./types";

function makeComment(overrides: Partial<CommentView> = {}): CommentView {
  return {
    id: "c1",
    readingId: "r1",
    authorId: "u1",
    authorName: "Jane Doe",
    parentId: null,
    content: "Hello",
    deleted: false,
    createdAt: "2026-05-22T10:00:00.000Z",
    editedAt: null,
    reactionCounts: {},
    replies: [],
    ...overrides,
  };
}

describe("forum utils", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("timeAgo", () => {
    it("returns 'baru saja' for under one minute", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-22T10:00:30.000Z"));

      expect(timeAgo("2026-05-22T10:00:10.000Z")).toBe("baru saja");
    });

    it("returns minutes and hours", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-22T12:00:00.000Z"));

      expect(timeAgo("2026-05-22T11:55:00.000Z")).toBe("5 menit lalu");
      expect(timeAgo("2026-05-22T10:00:00.000Z")).toBe("2 jam lalu");
    });

    it("returns days for recent dates", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-05T00:00:00.000Z"));

      expect(timeAgo("2026-05-01T00:00:00.000Z")).toBe("4 hari lalu");
    });

    it("returns a formatted date for older timestamps", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-06-15T00:00:00.000Z"));

      const older = new Date("2026-04-10T00:00:00.000Z");
      const expected = older.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      expect(timeAgo(older.toISOString())).toBe(expected);
    });
  });

  describe("countComments", () => {
    it("counts nested replies", () => {
      const comments = [
        makeComment({
          id: "c1",
          replies: [
            makeComment({ id: "c2", parentId: "c1" }),
            makeComment({
              id: "c3",
              parentId: "c1",
              replies: [makeComment({ id: "c4", parentId: "c3" })],
            }),
          ],
        }),
        makeComment({ id: "c5" }),
      ];

      expect(countComments(comments)).toBe(5);
    });
  });
});

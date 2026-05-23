import { describe, it, expect, beforeEach, vi } from "vitest";
import * as forumApi from "./api";
import * as authApi from "../auth/api";

function mockFetch(response: unknown, status = 200, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
  });
}

describe("forum api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("fetchComments calls the comments endpoint", async () => {
    authApi.setToken("token");
    const fetchMock = mockFetch([]);
    global.fetch = fetchMock;

    const result = await forumApi.fetchComments("reading-1");

    expect(result).toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/forums/reading-1/comments",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token" }),
      })
    );
  });

  it("postComment sends POST with body", async () => {
    authApi.setToken("token");
    const fetchMock = mockFetch({ id: "c1" });
    global.fetch = fetchMock;

    await forumApi.postComment("reading-2", { content: "Hi" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/forums/reading-2/comments",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ content: "Hi" }),
      })
    );
  });

  it("replyToComment posts a reply", async () => {
    authApi.setToken("token");
    const fetchMock = mockFetch({ id: "c2" });
    global.fetch = fetchMock;

    await forumApi.replyToComment("comment-1", { content: "Reply" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/forums/comments/comment-1/replies",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ content: "Reply" }),
      })
    );
  });

  it("editComment sends PUT with new content", async () => {
    authApi.setToken("token");
    const fetchMock = mockFetch({}, 204, true);
    global.fetch = fetchMock;

    await forumApi.editComment("comment-2", { newContent: "Updated" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/forums/comments/comment-2",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ newContent: "Updated" }),
      })
    );
  });

  it("deleteComment sends DELETE", async () => {
    authApi.setToken("token");
    const fetchMock = mockFetch({}, 204, true);
    global.fetch = fetchMock;

    await forumApi.deleteComment("comment-3");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/forums/comments/comment-3",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("deleteCommentAsAdmin sends DELETE to admin endpoint", async () => {
    authApi.setToken("token");
    const fetchMock = mockFetch({}, 204, true);
    global.fetch = fetchMock;

    await forumApi.deleteCommentAsAdmin("comment-4");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/forums/comments/comment-4",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("toggleReaction posts reaction", async () => {
    authApi.setToken("token");
    const fetchMock = mockFetch({}, 204, true);
    global.fetch = fetchMock;

    await forumApi.toggleReaction("comment-5", { type: "UPVOTE" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/forums/comments/comment-5/reactions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ type: "UPVOTE" }),
      })
    );
  });
});

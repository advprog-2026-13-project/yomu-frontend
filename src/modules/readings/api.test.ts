import { describe, it, expect, beforeEach, vi } from "vitest";
import * as readingsApi from "./api";
import * as authApi from "../auth/api";

function mockFetch(response: unknown, status = 200, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
  });
}

describe("readings api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe("authHeaders", () => {
    it("includes Authorization header when token exists", async () => {
      authApi.setToken("my-token");
      const fetchMock = mockFetch([]);
      global.fetch = fetchMock;

      await readingsApi.fetchReadings();

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/student/readings",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer my-token",
          }),
        })
      );
    });

    it("omits Authorization header when no token", async () => {
      const fetchMock = mockFetch([]);
      global.fetch = fetchMock;

      await readingsApi.fetchReadings();

      const headers = fetchMock.mock.calls[0][1].headers;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe("request helper", () => {
    it("handles 204 status", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      const result = await readingsApi.completeReading("id");
      expect(result).toBeUndefined();
    });

    it("throws on error response with message", async () => {
      global.fetch = mockFetch({ message: "Not found" }, 404, false);

      await expect(readingsApi.fetchReadings()).rejects.toThrow("Not found");
    });

    it("throws with fallback message when no message in response", async () => {
      global.fetch = mockFetch({}, 500, false);

      await expect(readingsApi.fetchReadings()).rejects.toThrow(
        "Request failed with status 500"
      );
    });

    it("handles non-JSON error response gracefully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Not JSON");
        },
      });

      await expect(readingsApi.fetchReadings()).rejects.toThrow(
        "Request failed with status 500"
      );
    });
  });

  describe("fetchReadings", () => {
    it("returns readings array", async () => {
      const data = [{ readingId: "1", title: "Book", content: "Content" }];
      global.fetch = mockFetch(data);

      const result = await readingsApi.fetchReadings();
      expect(result).toEqual(data);
    });
  });

  describe("fetchReadingById", () => {
    it("calls correct endpoint", async () => {
      const reading = { readingId: "1", title: "Book", content: "Content" };
      const fetchMock = mockFetch(reading);
      global.fetch = fetchMock;

      const result = await readingsApi.fetchReadingById("1");

      expect(result).toEqual(reading);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/student/readings/1",
        expect.any(Object)
      );
    });
  });

  describe("fetchReadingQuestions", () => {
    it("calls correct endpoint", async () => {
      const questions = [
        { questionId: "q1", questionText: "What?", options: ["A", "B"] },
      ];
      const fetchMock = mockFetch(questions);
      global.fetch = fetchMock;

      const result = await readingsApi.fetchReadingQuestions("1");

      expect(result).toEqual(questions);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/student/readings/1/questions",
        expect.any(Object)
      );
    });
  });

  describe("submitQuiz", () => {
    it("sends POST with answers payload", async () => {
      const payload = {
        answers: [{ questionId: "q1", selectedAnswer: "A" }],
      };
      const attempt = {
        quizAttemptId: "a1",
        studentId: "s1",
        readingId: "r1",
        score: 100,
        completedAt: "2026-05-22T00:00:00",
      };
      const fetchMock = mockFetch(attempt);
      global.fetch = fetchMock;

      const result = await readingsApi.submitQuiz("r1", payload);

      expect(result).toEqual(attempt);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/student/readings/r1/submit",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe("completeReading", () => {
    it("sends POST to complete endpoint", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      await readingsApi.completeReading("r1");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/student/readings/r1/complete",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("adminGetAll", () => {
    it("returns all readings for admin", async () => {
      const data = [{ readingId: "1", title: "Book", content: "C" }];
      global.fetch = mockFetch(data);

      const result = await readingsApi.adminGetAll();
      expect(result).toEqual(data);
    });
  });

  describe("adminCreateReading", () => {
    it("sends POST with payload", async () => {
      const payload = { title: "New", content: "Content", author: "Author" };
      const created = { readingId: "new-1", ...payload };
      const fetchMock = mockFetch(created);
      global.fetch = fetchMock;

      const result = await readingsApi.adminCreateReading(payload);

      expect(result).toEqual(created);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/readings",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe("adminUpdateReading", () => {
    it("sends PUT with payload", async () => {
      const payload = { title: "Updated", content: "C", author: "A" };
      const updated = { readingId: "1", ...payload };
      const fetchMock = mockFetch(updated);
      global.fetch = fetchMock;

      const result = await readingsApi.adminUpdateReading("1", payload);

      expect(result).toEqual(updated);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/readings/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe("adminDeleteReading", () => {
    it("sends DELETE to correct endpoint", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      await readingsApi.adminDeleteReading("1");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/readings/1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("adminHideReading", () => {
    it("sends PATCH to hide endpoint", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      await readingsApi.adminHideReading("1");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/readings/1/hide",
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  describe("adminUnhideReading", () => {
    it("sends PATCH to unhide endpoint", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      await readingsApi.adminUnhideReading("1");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/readings/1/unhide",
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  describe("adminAddQuestion", () => {
    it("sends POST with question payload", async () => {
      const payload = {
        questionText: "What?",
        options: ["A", "B", "C"],
        correctAnswer: "A",
      };
      const created = { questionId: "q1", ...payload };
      const fetchMock = mockFetch(created);
      global.fetch = fetchMock;

      const result = await readingsApi.adminAddQuestion("r1", payload);

      expect(result).toEqual(created);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/readings/r1/questions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe("adminUpdateQuestion", () => {
    it("sends PUT with question payload", async () => {
      const payload = {
        questionText: "Updated?",
        options: ["X", "Y"],
        correctAnswer: "X",
      };
      const updated = { questionId: "q1", ...payload };
      const fetchMock = mockFetch(updated);
      global.fetch = fetchMock;

      const result = await readingsApi.adminUpdateQuestion("q1", payload);

      expect(result).toEqual(updated);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/questions/q1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe("adminDeleteQuestion", () => {
    it("sends DELETE to correct endpoint", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      await readingsApi.adminDeleteQuestion("q1");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/questions/q1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});

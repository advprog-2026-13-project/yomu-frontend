import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as api from "./api";

vi.mock("./api", () => ({
  fetchReadings: vi.fn(),
  fetchReadingById: vi.fn(),
  fetchReadingQuestions: vi.fn(),
  submitQuiz: vi.fn(),
  completeReading: vi.fn(),
  adminGetAll: vi.fn(),
  adminCreateReading: vi.fn(),
  adminUpdateReading: vi.fn(),
  adminDeleteReading: vi.fn(),
  adminHideReading: vi.fn(),
  adminUnhideReading: vi.fn(),
  adminAddQuestion: vi.fn(),
  adminUpdateQuestion: vi.fn(),
  adminDeleteQuestion: vi.fn(),
}));

describe("readings hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useReadings", () => {
    it("fetches readings on mount", async () => {
      const readings = [{ readingId: "r1", title: "Book", content: "Content" }];
      vi.mocked(api.fetchReadings).mockResolvedValue(readings);

      const { useReadings } = await import("./hooks");
      const { result } = renderHook(() => useReadings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.readings).toEqual(readings);
      expect(result.current.error).toBeNull();
    });

    it("sets error on fetch failure", async () => {
      vi.mocked(api.fetchReadings).mockRejectedValue(new Error("Fail"));

      const { useReadings } = await import("./hooks");
      const { result } = renderHook(() => useReadings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("useReadingDetails", () => {
    it("fetches reading and questions on mount", async () => {
      const reading = { readingId: "r1", title: "Book", content: "Content" };
      const questions = [{ questionId: "q1", questionText: "What?", options: ["A", "B"] }];

      vi.mocked(api.fetchReadingById).mockResolvedValue(reading);
      vi.mocked(api.fetchReadingQuestions).mockResolvedValue(questions);

      const { useReadingDetails } = await import("./hooks");
      const { result } = renderHook(() => useReadingDetails("r1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.reading).toEqual(reading);
      expect(result.current.questions).toEqual(questions);
      expect(result.current.error).toBeNull();
    });

    it("does not fetch when id is empty", async () => {
      const { useReadingDetails } = await import("./hooks");
      renderHook(() => useReadingDetails(""));

      await new Promise((r) => setTimeout(r, 100));
      expect(api.fetchReadingById).not.toHaveBeenCalled();
    });

    it("sets error on fetch failure", async () => {
      vi.mocked(api.fetchReadingById).mockRejectedValue(new Error("Not found"));
      vi.mocked(api.fetchReadingQuestions).mockResolvedValue([]);

      const { useReadingDetails } = await import("./hooks");
      const { result } = renderHook(() => useReadingDetails("r1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("useSubmitQuiz", () => {
    it("submits quiz and returns attempt", async () => {
      const attempt = {
        quizAttemptId: "a1",
        studentId: "s1",
        readingId: "r1",
        score: 100,
        completedAt: "2026-05-22",
      };
      vi.mocked(api.submitQuiz).mockResolvedValue(attempt);

      const { useSubmitQuiz } = await import("./hooks");
      const { result } = renderHook(() => useSubmitQuiz());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.submit("r1", {
          answers: [{ questionId: "q1", selectedAnswer: "A" }],
        });
      });

      expect(returnVal).toEqual(attempt);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("returns null and sets error on failure", async () => {
      vi.mocked(api.submitQuiz).mockRejectedValue(new Error("Failed"));

      const { useSubmitQuiz } = await import("./hooks");
      const { result } = renderHook(() => useSubmitQuiz());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.submit("r1", { answers: [] });
      });

      expect(returnVal).toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("handles non-Error rejection", async () => {
      vi.mocked(api.submitQuiz).mockRejectedValue("string error");

      const { useSubmitQuiz } = await import("./hooks");
      const { result } = renderHook(() => useSubmitQuiz());

      await act(async () => {
        await result.current.submit("r1", { answers: [] });
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("string error");
    });
  });

  describe("useCompleteReading", () => {
    it("returns true on success", async () => {
      vi.mocked(api.completeReading).mockResolvedValue(undefined);

      const { useCompleteReading } = await import("./hooks");
      const { result } = renderHook(() => useCompleteReading());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.complete("r1");
      });

      expect(returnVal).toBe(true);
    });

    it("returns false on failure", async () => {
      vi.mocked(api.completeReading).mockRejectedValue(new Error("Fail"));

      const { useCompleteReading } = await import("./hooks");
      const { result } = renderHook(() => useCompleteReading());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.complete("r1");
      });

      expect(returnVal).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("useAdminReadings", () => {
    it("fetches readings on mount and provides refresh", async () => {
      const readings = [{ readingId: "r1", title: "Book", content: "C" }];
      vi.mocked(api.adminGetAll).mockResolvedValue(readings);

      const { useAdminReadings } = await import("./hooks");
      const { result } = renderHook(() => useAdminReadings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.readings).toEqual(readings);
      expect(api.adminGetAll).toHaveBeenCalledTimes(1);

      // Test refresh
      vi.mocked(api.adminGetAll).mockResolvedValue([]);
      await act(async () => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(api.adminGetAll).toHaveBeenCalledTimes(2);
    });

    it("sets error on fetch failure", async () => {
      vi.mocked(api.adminGetAll).mockRejectedValue(new Error("Fail"));

      const { useAdminReadings } = await import("./hooks");
      const { result } = renderHook(() => useAdminReadings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("useAdminActions", () => {
    it("createReading calls api and returns result", async () => {
      const payload = { title: "New", content: "C", author: "A" };
      const created = { readingId: "new-1", ...payload };
      vi.mocked(api.adminCreateReading).mockResolvedValue(created);

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.createReading(payload);
      });

      expect(returnVal).toEqual(created);
    });

    it("createReading returns null on failure", async () => {
      vi.mocked(api.adminCreateReading).mockRejectedValue(new Error("Fail"));

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.createReading({ title: "T", content: "C", author: "A" });
      });

      expect(returnVal).toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("updateReading calls api and returns result", async () => {
      const updated = { readingId: "1", title: "Updated", content: "C", author: "A" };
      vi.mocked(api.adminUpdateReading).mockResolvedValue(updated);

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.updateReading("1", { title: "Updated", content: "C", author: "A" });
      });

      expect(returnVal).toEqual(updated);
    });

    it("updateReading returns null on failure", async () => {
      vi.mocked(api.adminUpdateReading).mockRejectedValue(new Error("Fail"));

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      await act(async () => {
        await result.current.updateReading("1", { title: "U", content: "C", author: "A" });
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("deleteReading returns true on success", async () => {
      vi.mocked(api.adminDeleteReading).mockResolvedValue(undefined);

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.deleteReading("1");
      });

      expect(returnVal).toBe(true);
    });

    it("deleteReading returns false on failure", async () => {
      vi.mocked(api.adminDeleteReading).mockRejectedValue(new Error("Fail"));

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.deleteReading("1");
      });

      expect(returnVal).toBe(false);
    });

    it("hideReading returns true on success", async () => {
      vi.mocked(api.adminHideReading).mockResolvedValue(undefined);

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.hideReading("1");
      });

      expect(returnVal).toBe(true);
    });

    it("hideReading returns false on failure", async () => {
      vi.mocked(api.adminHideReading).mockRejectedValue(new Error("Fail"));

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.hideReading("1");
      });

      expect(returnVal).toBe(false);
    });

    it("unhideReading returns true on success", async () => {
      vi.mocked(api.adminUnhideReading).mockResolvedValue(undefined);

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.unhideReading("1");
      });

      expect(returnVal).toBe(true);
    });

    it("unhideReading returns false on failure", async () => {
      vi.mocked(api.adminUnhideReading).mockRejectedValue(new Error("Fail"));

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.unhideReading("1");
      });

      expect(returnVal).toBe(false);
    });

    it("addQuestion calls api and returns result", async () => {
      const payload = { questionText: "Q?", options: ["A", "B"], correctAnswer: "A" };
      const created = { questionId: "q1", ...payload };
      vi.mocked(api.adminAddQuestion).mockResolvedValue(created);

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.addQuestion("r1", payload);
      });

      expect(returnVal).toEqual(created);
    });

    it("addQuestion returns null on failure", async () => {
      vi.mocked(api.adminAddQuestion).mockRejectedValue(new Error("Fail"));

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.addQuestion("r1", { questionText: "Q?", options: [], correctAnswer: "A" });
      });

      expect(returnVal).toBeNull();
    });

    it("updateQuestion calls api and returns result", async () => {
      const payload = { questionText: "Updated?", options: ["X"], correctAnswer: "X" };
      const updated = { questionId: "q1", ...payload };
      vi.mocked(api.adminUpdateQuestion).mockResolvedValue(updated);

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.updateQuestion("q1", payload);
      });

      expect(returnVal).toEqual(updated);
    });

    it("updateQuestion returns null on failure", async () => {
      vi.mocked(api.adminUpdateQuestion).mockRejectedValue(new Error("Fail"));

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      await act(async () => {
        await result.current.updateQuestion("q1", { questionText: "Q?", options: [], correctAnswer: "A" });
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("deleteQuestion returns true on success", async () => {
      vi.mocked(api.adminDeleteQuestion).mockResolvedValue(undefined);

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.deleteQuestion("q1");
      });

      expect(returnVal).toBe(true);
    });

    it("deleteQuestion returns false on failure", async () => {
      vi.mocked(api.adminDeleteQuestion).mockRejectedValue(new Error("Fail"));

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.deleteQuestion("q1");
      });

      expect(returnVal).toBe(false);
    });

    it("handles non-Error rejection in actions", async () => {
      vi.mocked(api.adminCreateReading).mockRejectedValue("string error");

      const { useAdminActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminActions());

      await act(async () => {
        await result.current.createReading({ title: "T", content: "C", author: "A" });
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("string error");
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as adminApi from "./api";

vi.mock("@/src/modules/auth/api", () => ({
  getToken: vi.fn(() => "fake-token"),
}));

const mockFetch = vi.fn();
const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = mockFetch;
  vi.mocked(mockFetch).mockReset();
  vi.resetModules();
});

afterEach(() => {
  global.fetch = originalFetch;
});

function mockResponse(status: number, body?: unknown) {
  mockFetch.mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body || {}),
  });
}

describe("admin API", () => {
  it("fetchReadings calls correct endpoint", async () => {
    mockResponse(200, []);
    await adminApi.fetchReadings();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/readings"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.any(String) }) })
    );
  });

  it("createReading sends POST", async () => {
    mockResponse(201, { readingId: "1" });
    await adminApi.createReading({ title: "Test", content: "Content", author: "Author" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/readings"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("updateReading sends PUT", async () => {
    mockResponse(200, { readingId: "1" });
    await adminApi.updateReading("id-1", { title: "Updated" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/readings/id-1"),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("deleteReading sends DELETE", async () => {
    mockResponse(204);
    await adminApi.deleteReading("id-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/readings/id-1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("fetchQuestions calls correct endpoint", async () => {
    mockResponse(200, []);
    await adminApi.fetchQuestions("reading-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/readings/reading-1/questions"),
      expect.any(Object)
    );
  });

  it("createQuestion sends POST", async () => {
    mockResponse(201, { id: "1" });
    await adminApi.createQuestion("reading-1", { questionText: "Q?", options: ["A"], correctAnswer: "A" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/readings/reading-1/questions"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("updateQuestion sends PUT", async () => {
    mockResponse(200, { id: "1" });
    await adminApi.updateQuestion("q-1", { questionText: "Updated" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/questions/q-1"),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("deleteQuestion sends DELETE", async () => {
    mockResponse(204);
    await adminApi.deleteQuestion("q-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/questions/q-1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("fetchAchievements calls correct endpoint", async () => {
    mockResponse(200, []);
    await adminApi.fetchAchievements();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/achievements"),
      expect.any(Object)
    );
  });

  it("createAchievement sends POST", async () => {
    mockResponse(201, { id: "1" });
    await adminApi.createAchievement({ name: "Test", type: "READING_COMPLETED", milestone: 5 });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/achievements"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("updateAchievement sends PUT", async () => {
    mockResponse(200, { id: "1" });
    await adminApi.updateAchievement("a-1", { name: "Updated" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/achievements/a-1"),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("deleteAchievement sends DELETE", async () => {
    mockResponse(204);
    await adminApi.deleteAchievement("a-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/achievements/a-1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("fetchDailyMissions calls correct endpoint", async () => {
    mockResponse(200, []);
    await adminApi.fetchDailyMissions();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/achievements/daily-missions"),
      expect.any(Object)
    );
  });

  it("createDailyMission sends POST", async () => {
    mockResponse(201, { id: "1" });
    await adminApi.createDailyMission({ name: "Test", targetType: "QUIZ_COMPLETED", milestone: 3 });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/achievements/daily-missions"),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("updateDailyMission sends PUT", async () => {
    mockResponse(200, { id: "1" });
    await adminApi.updateDailyMission("m-1", { name: "Updated" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/achievements/daily-missions/m-1"),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("deleteDailyMission sends DELETE", async () => {
    mockResponse(204);
    await adminApi.deleteDailyMission("m-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/achievements/daily-missions/m-1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("deleteForumComment sends DELETE", async () => {
    mockResponse(204);
    await adminApi.deleteForumComment("c-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/forums/comments/c-1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("fetchUsers calls correct endpoint", async () => {
    mockResponse(200, []);
    await adminApi.fetchUsers();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/users"),
      expect.any(Object)
    );
  });

  it("promoteUser sends PUT", async () => {
    mockResponse(204);
    await adminApi.promoteUser("u-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/users/u-1/promote"),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("demoteUser sends PUT", async () => {
    mockResponse(204);
    await adminApi.demoteUser("u-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/users/u-1/demote"),
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("throws on error response", async () => {
    mockResponse(500, { message: "Server error" });
    await expect(adminApi.fetchReadings()).rejects.toThrow("Server error");
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as achievementsApi from "./api";
import * as authApi from "../auth/api";

function mockFetch(response: unknown, status = 200, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
  });
}

describe("achievements api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe("authHeaders", () => {
    it("includes Authorization header when token exists", async () => {
      authApi.setToken("my-token");
      const fetchMock = mockFetch([]);
      global.fetch = fetchMock;

      await achievementsApi.fetchAllAchievements();

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/achievements",
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

      await achievementsApi.fetchAllAchievements();

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

      const result = await achievementsApi.adminDeleteAchievement("id");
      expect(result).toBeUndefined();
    });

    it("throws on error response with message", async () => {
      global.fetch = mockFetch({ message: "Not found" }, 404, false);

      await expect(achievementsApi.fetchAllAchievements()).rejects.toThrow(
        "Not found"
      );
    });

    it("throws with fallback message when no message in response", async () => {
      global.fetch = mockFetch({}, 500, false);

      await expect(achievementsApi.fetchAllAchievements()).rejects.toThrow(
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

      await expect(achievementsApi.fetchAllAchievements()).rejects.toThrow(
        "Request failed with status 500"
      );
    });
  });

  describe("fetchAllAchievements", () => {
    it("returns achievements array", async () => {
      const data = [
        { id: "1", name: "Reader", description: "Read 5 books", type: "READ", milestone: 5 },
      ];
      global.fetch = mockFetch(data);

      const result = await achievementsApi.fetchAllAchievements();
      expect(result).toEqual(data);
    });
  });

  describe("fetchAllDailyMissions", () => {
    it("returns daily missions array", async () => {
      const data = [
        { id: "1", name: "Daily Read", description: "Read today", targetType: "READ", milestone: 1 },
      ];
      global.fetch = mockFetch(data);

      const result = await achievementsApi.fetchAllDailyMissions();
      expect(result).toEqual(data);
    });
  });

  describe("fetchUserProgress", () => {
    it("calls correct endpoint with userId", async () => {
      const fetchMock = mockFetch([]);
      global.fetch = fetchMock;

      await achievementsApi.fetchUserProgress("user-123");

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/achievements/users/user-123/progress",
        expect.any(Object)
      );
    });
  });

  describe("fetchUserDailyProgress", () => {
    it("calls correct endpoint with userId", async () => {
      const fetchMock = mockFetch([]);
      global.fetch = fetchMock;

      await achievementsApi.fetchUserDailyProgress("user-123");

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/achievements/users/user-123/daily-progress",
        expect.any(Object)
      );
    });
  });

  describe("fetchCompletedAchievements", () => {
    it("calls correct endpoint with userId", async () => {
      const fetchMock = mockFetch([]);
      global.fetch = fetchMock;

      await achievementsApi.fetchCompletedAchievements("user-123");

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/achievements/users/user-123/completed",
        expect.any(Object)
      );
    });
  });

  describe("adminCreateAchievement", () => {
    it("sends POST with correct payload", async () => {
      const payload = { name: "Test", description: "Desc", type: "READ", milestone: 10 };
      const created = { id: "new-1", ...payload };
      const fetchMock = mockFetch(created);
      global.fetch = fetchMock;

      const result = await achievementsApi.adminCreateAchievement(payload);

      expect(result).toEqual(created);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/achievements",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe("adminCreateDailyMission", () => {
    it("sends POST with correct payload", async () => {
      const payload = { name: "Daily", description: "D", targetType: "READ", milestone: 1 };
      const created = { id: "m-1", ...payload };
      const fetchMock = mockFetch(created);
      global.fetch = fetchMock;

      const result = await achievementsApi.adminCreateDailyMission(payload);

      expect(result).toEqual(created);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/achievements/daily-missions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe("adminUpdateAchievement", () => {
    it("sends PUT with correct payload", async () => {
      const payload = { name: "Updated" };
      const updated = { id: "1", name: "Updated", description: "D", type: "READ", milestone: 5 };
      const fetchMock = mockFetch(updated);
      global.fetch = fetchMock;

      const result = await achievementsApi.adminUpdateAchievement("1", payload);

      expect(result).toEqual(updated);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/achievements/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe("adminUpdateDailyMission", () => {
    it("sends PUT with correct payload", async () => {
      const payload = { name: "Updated Mission" };
      const updated = { id: "m-1", name: "Updated Mission", description: "D", targetType: "READ", milestone: 1 };
      const fetchMock = mockFetch(updated);
      global.fetch = fetchMock;

      const result = await achievementsApi.adminUpdateDailyMission("m-1", payload);

      expect(result).toEqual(updated);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/achievements/daily-missions/m-1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe("adminDeleteAchievement", () => {
    it("sends DELETE to correct endpoint", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      await achievementsApi.adminDeleteAchievement("1");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/achievements/1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("adminDeleteDailyMission", () => {
    it("sends DELETE to correct endpoint", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      await achievementsApi.adminDeleteDailyMission("m-1");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/achievements/daily-missions/m-1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("adminResetAll", () => {
    it("sends POST to reset all endpoint", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      await achievementsApi.adminResetAll();

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/achievements/daily-missions/reset",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("adminResetForUser", () => {
    it("sends POST to reset user endpoint", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      await achievementsApi.adminResetForUser("user-1");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/achievements/daily-missions/reset/user-1",
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});

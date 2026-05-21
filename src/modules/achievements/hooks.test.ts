import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as api from "./api";

const mockUser = { id: "user-1", username: "bob", displayName: "Bob", role: "USER" };

vi.mock("../auth/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock("./api", () => ({
  fetchAllAchievements: vi.fn(),
  fetchAllDailyMissions: vi.fn(),
  fetchUserProgress: vi.fn(),
  fetchUserDailyProgress: vi.fn(),
  fetchCompletedAchievements: vi.fn(),
  adminCreateAchievement: vi.fn(),
  adminUpdateAchievement: vi.fn(),
  adminDeleteAchievement: vi.fn(),
  adminCreateDailyMission: vi.fn(),
  adminUpdateDailyMission: vi.fn(),
  adminDeleteDailyMission: vi.fn(),
  adminResetAll: vi.fn(),
  adminResetForUser: vi.fn(),
}));

describe("achievements hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useUserAchievements", () => {
    it("fetches user progress and daily progress on mount", async () => {
      const progress = [{ id: "p1", userId: "user-1", achievementId: "a1", currentProgress: 3, completed: false, completedAt: null }];
      const dailyProgress = [{ id: "d1", userId: "user-1", missionId: "m1", currentProgress: 1, completed: true, completedAt: "2026-05-22", isCompleted: true }];

      vi.mocked(api.fetchUserProgress).mockResolvedValue(progress);
      vi.mocked(api.fetchUserDailyProgress).mockResolvedValue(dailyProgress);

      const { useUserAchievements } = await import("./hooks");
      const { result } = renderHook(() => useUserAchievements());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.progress).toEqual(progress);
      expect(result.current.dailyProgress).toEqual(dailyProgress);
      expect(result.current.error).toBeNull();
    });

    it("sets error on fetch failure", async () => {
      vi.mocked(api.fetchUserProgress).mockRejectedValue(new Error("Network error"));
      vi.mocked(api.fetchUserDailyProgress).mockResolvedValue([]);

      const { useUserAchievements } = await import("./hooks");
      const { result } = renderHook(() => useUserAchievements());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("useMasterAchievements", () => {
    it("fetches all achievements and daily missions on mount", async () => {
      const achievements = [{ id: "a1", name: "Reader", description: "Read books", type: "READ", milestone: 5 }];
      const dailyMissions = [{ id: "m1", name: "Daily", description: "Daily read", targetType: "READ", milestone: 1 }];

      vi.mocked(api.fetchAllAchievements).mockResolvedValue(achievements);
      vi.mocked(api.fetchAllDailyMissions).mockResolvedValue(dailyMissions);

      const { useMasterAchievements } = await import("./hooks");
      const { result } = renderHook(() => useMasterAchievements());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.achievements).toEqual(achievements);
      expect(result.current.dailyMissions).toEqual(dailyMissions);
      expect(result.current.error).toBeNull();
    });

    it("sets error on fetch failure", async () => {
      vi.mocked(api.fetchAllAchievements).mockRejectedValue(new Error("Fail"));
      vi.mocked(api.fetchAllDailyMissions).mockResolvedValue([]);

      const { useMasterAchievements } = await import("./hooks");
      const { result } = renderHook(() => useMasterAchievements());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("useAdminAchievementActions", () => {
    it("createAchievement calls api and returns result", async () => {
      const payload = { name: "Test", description: "D", type: "READ", milestone: 10 };
      const created = { id: "new-1", ...payload };
      vi.mocked(api.adminCreateAchievement).mockResolvedValue(created);

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.createAchievement(payload);
      });

      expect(returnVal).toEqual(created);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("createAchievement sets error on failure", async () => {
      vi.mocked(api.adminCreateAchievement).mockRejectedValue(new Error("Fail"));

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.createAchievement({ name: "T", description: "D", type: "R", milestone: 1 });
      });

      expect(returnVal).toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("updateAchievement calls api and returns result", async () => {
      const updated = { id: "1", name: "Updated", description: "D", type: "READ", milestone: 5 };
      vi.mocked(api.adminUpdateAchievement).mockResolvedValue(updated);

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.updateAchievement("1", { name: "Updated" });
      });

      expect(returnVal).toEqual(updated);
    });

    it("updateAchievement sets error on failure", async () => {
      vi.mocked(api.adminUpdateAchievement).mockRejectedValue("string error");

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      await act(async () => {
        await result.current.updateAchievement("1", { name: "U" });
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("deleteAchievement returns true on success", async () => {
      vi.mocked(api.adminDeleteAchievement).mockResolvedValue(undefined);

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.deleteAchievement("1");
      });

      expect(returnVal).toBe(true);
    });

    it("deleteAchievement returns false on failure", async () => {
      vi.mocked(api.adminDeleteAchievement).mockRejectedValue(new Error("Fail"));

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.deleteAchievement("1");
      });

      expect(returnVal).toBe(false);
    });

    it("createDailyMission calls api and returns result", async () => {
      const payload = { name: "DM", description: "D", targetType: "READ", milestone: 1 };
      const created = { id: "dm-1", ...payload };
      vi.mocked(api.adminCreateDailyMission).mockResolvedValue(created);

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.createDailyMission(payload);
      });

      expect(returnVal).toEqual(created);
    });

    it("createDailyMission sets error on failure", async () => {
      vi.mocked(api.adminCreateDailyMission).mockRejectedValue(new Error("Fail"));

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      await act(async () => {
        await result.current.createDailyMission({ name: "D", description: "D", targetType: "R", milestone: 1 });
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("updateDailyMission calls api and returns result", async () => {
      const updated = { id: "dm-1", name: "Updated", description: "D", targetType: "READ", milestone: 1 };
      vi.mocked(api.adminUpdateDailyMission).mockResolvedValue(updated);

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.updateDailyMission("dm-1", { name: "Updated" });
      });

      expect(returnVal).toEqual(updated);
    });

    it("updateDailyMission sets error on failure", async () => {
      vi.mocked(api.adminUpdateDailyMission).mockRejectedValue(new Error("Fail"));

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      await act(async () => {
        await result.current.updateDailyMission("dm-1", { name: "U" });
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("deleteDailyMission returns true on success", async () => {
      vi.mocked(api.adminDeleteDailyMission).mockResolvedValue(undefined);

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.deleteDailyMission("dm-1");
      });

      expect(returnVal).toBe(true);
    });

    it("deleteDailyMission returns false on failure", async () => {
      vi.mocked(api.adminDeleteDailyMission).mockRejectedValue(new Error("Fail"));

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.deleteDailyMission("dm-1");
      });

      expect(returnVal).toBe(false);
    });

    it("resetAll returns true on success", async () => {
      vi.mocked(api.adminResetAll).mockResolvedValue(undefined);

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.resetAll();
      });

      expect(returnVal).toBe(true);
    });

    it("resetAll returns false on failure", async () => {
      vi.mocked(api.adminResetAll).mockRejectedValue(new Error("Fail"));

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.resetAll();
      });

      expect(returnVal).toBe(false);
    });

    it("resetForUser returns true on success", async () => {
      vi.mocked(api.adminResetForUser).mockResolvedValue(undefined);

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.resetForUser("user-1");
      });

      expect(returnVal).toBe(true);
    });

    it("resetForUser returns false on failure", async () => {
      vi.mocked(api.adminResetForUser).mockRejectedValue(new Error("Fail"));

      const { useAdminAchievementActions } = await import("./hooks");
      const { result } = renderHook(() => useAdminAchievementActions());

      let returnVal: unknown;
      await act(async () => {
        returnVal = await result.current.resetForUser("user-1");
      });

      expect(returnVal).toBe(false);
    });
  });
});

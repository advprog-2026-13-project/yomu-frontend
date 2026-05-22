import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";

vi.mock("@/src/modules/admin/api", () => ({
  fetchAchievements: vi.fn(() => Promise.resolve([])),
  createAchievement: vi.fn(),
  updateAchievement: vi.fn(),
  deleteAchievement: vi.fn(),
  fetchDailyMissions: vi.fn(() => Promise.resolve([])),
  createDailyMission: vi.fn(),
  updateDailyMission: vi.fn(),
  deleteDailyMission: vi.fn(),
}));

import AchievementsPage from "./page";

describe("AchievementsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without crashing", async () => {
    const { container } = render(<AchievementsPage />);
    await waitFor(() => {
      expect(container.textContent).toBeTruthy();
    });
  });
});

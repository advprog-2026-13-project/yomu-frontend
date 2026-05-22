import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/src/modules/auth", () => ({
    useAuth: () => ({ user: null, loading: false }),
    getToken: () => null,
    removeToken: vi.fn(),
    fetchUser: vi.fn(),
}));

vi.mock("@/src/modules/admin/api", () => ({
    fetchAchievements: vi.fn(() => Promise.resolve([])),
    createAchievement: vi.fn(() => Promise.resolve({})),
    updateAchievement: vi.fn(() => Promise.resolve({})),
    deleteAchievement: vi.fn(() => Promise.resolve()),
    fetchDailyMissions: vi.fn(() => Promise.resolve([])),
    createDailyMission: vi.fn(() => Promise.resolve({})),
    updateDailyMission: vi.fn(() => Promise.resolve({})),
    deleteDailyMission: vi.fn(() => Promise.resolve()),
}));

import AchievementsPage from "./page";

describe("AchievementsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders achievements heading", () => {
        render(<AchievementsPage />);
        expect(screen.getByText("Achievements & Missions")).toBeInTheDocument();
    });

    it("renders tabs", () => {
        render(<AchievementsPage />);
        expect(screen.getByText("Achievements")).toBeInTheDocument();
        expect(screen.getByText("Daily Missions")).toBeInTheDocument();
    });
});

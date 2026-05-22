import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/src/modules/auth", () => ({
    useAuth: () => ({ user: null, loading: false }),
    getToken: () => null,
    removeToken: vi.fn(),
    fetchUser: vi.fn(),
}));

vi.mock("@/src/modules/admin/api", () => ({
    fetchReadings: vi.fn(() => Promise.resolve([])),
    fetchAchievements: vi.fn(() => Promise.resolve([])),
    fetchDailyMissions: vi.fn(() => Promise.resolve([])),
}));

import AdminDashboardPage from "./page";

describe("AdminDashboardPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders dashboard heading", () => {
        render(<AdminDashboardPage />);
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("renders overview subtitle", () => {
        render(<AdminDashboardPage />);
        expect(screen.getByText("Overview of your platform content")).toBeInTheDocument();
    });

    it("renders stat cards", () => {
        render(<AdminDashboardPage />);
        expect(screen.getByText("Total Readings")).toBeInTheDocument();
        expect(screen.getByText("Total Achievements")).toBeInTheDocument();
        expect(screen.getByText("Daily Missions")).toBeInTheDocument();
    });
});

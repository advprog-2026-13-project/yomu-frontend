import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/src/modules/auth", () => ({
    useAuth: () => ({ user: null, loading: false }),
    getToken: () => null,
    removeToken: vi.fn(),
    fetchUser: vi.fn(),
}));

vi.mock("@/src/modules/social/api", () => ({
    getLeaderboard: vi.fn(() => Promise.resolve([])),
}));

import LeaderboardPage from "./page";

describe("LeaderboardPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders leaderboard heading", () => {
        render(<LeaderboardPage />);
        expect(screen.getByText("Leaderboard")).toBeInTheDocument();
    });

    it("renders tier filter buttons", () => {
        render(<LeaderboardPage />);
        expect(screen.getByText("BRONZE")).toBeInTheDocument();
        expect(screen.getByText("SILVER")).toBeInTheDocument();
        expect(screen.getByText("GOLD")).toBeInTheDocument();
        expect(screen.getByText("DIAMOND")).toBeInTheDocument();
    });
});

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

vi.mock("next/navigation", async () => {
    const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
    return {
        ...actual,
        useSearchParams: () => new URLSearchParams("tier=BRONZE"),
    };
});

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
        expect(screen.getByText("Bronze")).toBeInTheDocument();
        expect(screen.getByText("Silver")).toBeInTheDocument();
        expect(screen.getByText("Gold")).toBeInTheDocument();
        expect(screen.getByText("Diamond")).toBeInTheDocument();
    });
});

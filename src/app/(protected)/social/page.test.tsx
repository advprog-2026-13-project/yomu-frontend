import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/src/modules/auth", () => ({
    useAuth: () => ({ user: null, loading: false }),
    getToken: () => null,
    removeToken: vi.fn(),
    fetchUser: vi.fn(),
}));

vi.mock("@/src/modules/social/api", () => ({
    createClan: vi.fn(() => Promise.resolve({})),
    getMyClan: vi.fn(() => Promise.reject(new Error("No clan"))),
    leaveClan: vi.fn(() => Promise.resolve()),
    deleteClan: vi.fn(() => Promise.resolve()),
    getClanById: vi.fn(() => Promise.resolve({})),
    requestToJoinClan: vi.fn(() => Promise.resolve({})),
    getClanJoinRequests: vi.fn(() => Promise.resolve([])),
    approveJoinRequest: vi.fn(() => Promise.resolve()),
    rejectJoinRequest: vi.fn(() => Promise.resolve()),
}));

import ClanPage from "./page";

describe("ClanPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders clan heading", () => {
        render(<ClanPage />);
        expect(screen.getByText("Clan & Liga")).toBeInTheDocument();
    });

    it("renders create clan form after loading", async () => {
        render(<ClanPage />);
        const headings = await screen.findAllByText("Buat Clan");
        expect(headings.length).toBeGreaterThanOrEqual(2);
    });

    it("renders leaderboard link", () => {
        render(<ClanPage />);
        expect(screen.getByText("Liga & Leaderboard")).toBeInTheDocument();
    });
});

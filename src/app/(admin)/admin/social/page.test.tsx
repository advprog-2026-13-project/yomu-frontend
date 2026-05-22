import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/src/modules/auth", () => ({
    useAuth: () => ({ user: null, loading: false }),
    getToken: () => null,
    removeToken: vi.fn(),
    fetchUser: vi.fn(),
}));

vi.mock("@/src/modules/social/api", () => ({
    adminGetClans: vi.fn(() => Promise.resolve([])),
    adminGetClanMembers: vi.fn(() => Promise.resolve([])),
    adminRemoveMember: vi.fn(() => Promise.resolve()),
    adminDeleteClan: vi.fn(() => Promise.resolve()),
    adminGetJoinRequests: vi.fn(() => Promise.resolve([])),
    endSeason: vi.fn(() => Promise.resolve()),
}));

import AdminSocialPage from "./page";

describe("AdminSocialPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders social management heading", () => {
        render(<AdminSocialPage />);
        expect(screen.getByText("Social Management")).toBeInTheDocument();
    });

    it("renders tabs", () => {
        render(<AdminSocialPage />);
        expect(screen.getByText("clans")).toBeInTheDocument();
        expect(screen.getByText("Join Requests")).toBeInTheDocument();
        expect(screen.getByText("season")).toBeInTheDocument();
    });
});

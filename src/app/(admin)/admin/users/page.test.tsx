import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/src/modules/auth", () => ({
    useAuth: () => ({ user: null, loading: false }),
    getToken: () => null,
    removeToken: vi.fn(),
    fetchUser: vi.fn(),
}));

vi.mock("@/src/modules/admin/api", () => ({
    fetchUsers: vi.fn(() => Promise.resolve([])),
    promoteUser: vi.fn(() => Promise.resolve()),
    demoteUser: vi.fn(() => Promise.resolve()),
}));

import UsersPage from "./page";

describe("UsersPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders user management heading", () => {
        render(<UsersPage />);
        expect(screen.getByText("User Management")).toBeInTheDocument();
    });

    it("renders users table header", () => {
        render(<UsersPage />);
        expect(screen.getByText("Users")).toBeInTheDocument();
    });

    it("renders refresh button", () => {
        render(<UsersPage />);
        expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
    });
});

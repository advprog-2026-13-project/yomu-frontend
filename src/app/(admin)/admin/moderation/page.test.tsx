import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/src/modules/auth", () => ({
    useAuth: () => ({ user: null, loading: false }),
    getToken: () => null,
    removeToken: vi.fn(),
    fetchUser: vi.fn(),
}));

vi.mock("@/src/modules/admin/api", () => ({
    deleteForumComment: vi.fn(() => Promise.resolve()),
}));

import ForumPage from "./page";

describe("ForumPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders forum moderation heading", () => {
        render(<ForumPage />);
        expect(screen.getByText("Forum Moderation")).toBeInTheDocument();
    });

    it("renders delete comment form", () => {
        render(<ForumPage />);
        expect(screen.getAllByText("Delete Comment")).toHaveLength(2);
    });

    it("renders comment ID input", () => {
        render(<ForumPage />);
        expect(screen.getByLabelText("Comment ID (UUID)")).toBeInTheDocument();
    });
});

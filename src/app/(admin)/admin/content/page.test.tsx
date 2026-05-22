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
    createReading: vi.fn(() => Promise.resolve({})),
    updateReading: vi.fn(() => Promise.resolve({})),
    deleteReading: vi.fn(() => Promise.resolve()),
    fetchQuestions: vi.fn(() => Promise.resolve([])),
    createQuestion: vi.fn(() => Promise.resolve({})),
    updateQuestion: vi.fn(() => Promise.resolve({})),
    deleteQuestion: vi.fn(() => Promise.resolve()),
}));

import ReadingsPage from "./page";

describe("ReadingsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders content management heading", () => {
        render(<ReadingsPage />);
        expect(screen.getByText("Content Management")).toBeInTheDocument();
    });

    it("renders add reading button", () => {
        render(<ReadingsPage />);
        expect(screen.getByRole("button", { name: /add reading/i })).toBeInTheDocument();
    });
});

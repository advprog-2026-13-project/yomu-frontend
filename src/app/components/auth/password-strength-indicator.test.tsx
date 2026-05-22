import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { PasswordStrengthIndicator } from "./password-strength-indicator";

describe("PasswordStrengthIndicator", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders nothing for empty password", () => {
        const { container } = render(<PasswordStrengthIndicator password="" />);
        expect(container.firstChild).toBeNull();
    });

    it("renders weak strength for short password", () => {
        render(<PasswordStrengthIndicator password="abc" />);
        expect(screen.getByText("Lemah")).toBeInTheDocument();
    });

    it("renders medium strength for medium password", () => {
        render(<PasswordStrengthIndicator password="abcdef" />);
        expect(screen.getByText("Sedang")).toBeInTheDocument();
    });

    it("renders strong strength for long password", () => {
        render(<PasswordStrengthIndicator password="abcdefghij" />);
        expect(screen.getByText("Kuat")).toBeInTheDocument();
    });
});

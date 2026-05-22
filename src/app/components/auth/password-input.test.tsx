import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PasswordInput } from "./password-input";

describe("PasswordInput", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders password input", () => {
        render(<PasswordInput aria-label="Password" />);
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("toggles password visibility", async () => {
        const user = userEvent.setup();
        render(<PasswordInput aria-label="Password" />);

        const input = screen.getByLabelText("Password");
        expect(input).toHaveAttribute("type", "password");

        const toggleButton = screen.getByRole("button", { name: /show password/i });
        await user.click(toggleButton);

        expect(input).toHaveAttribute("type", "text");
    });

    it("toggles back to hidden", async () => {
        const user = userEvent.setup();
        render(<PasswordInput aria-label="Password" />);

        const toggleButton = screen.getByRole("button", { name: /show password/i });
        await user.click(toggleButton);
        await user.click(toggleButton);

        const input = screen.getByLabelText("Password");
        expect(input).toHaveAttribute("type", "password");
    });
});

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AchievementBadge } from "./AchievementBadge";

describe("AchievementBadge", () => {
    afterEach(() => {
        cleanup();
    });

    it("uses the Diamond identity (teal->emerald) for CLAN_REACHED_DIAMOND when unlocked", () => {
        render(<AchievementBadge type="CLAN_REACHED_DIAMOND" completed />);

        const badge = screen.getByTestId("achievement-badge");
        expect(badge).toHaveAttribute("aria-label", "Lencana terbuka");
        expect(badge).toHaveClass("from-teal-600");
        expect(screen.getByTestId("achievement-badge-sparkle")).toBeInTheDocument();
    });

    it("falls back to the default identity for other achievement types", () => {
        render(<AchievementBadge type="READING_COMPLETED" completed />);

        const badge = screen.getByTestId("achievement-badge");
        expect(badge).toHaveClass("from-yomu-primary");
    });

    it("renders a locked, sparkle-free state when not completed", () => {
        render(<AchievementBadge type="CLAN_REACHED_DIAMOND" completed={false} />);

        const badge = screen.getByTestId("achievement-badge");
        expect(badge).toHaveAttribute("aria-label", "Lencana terkunci");
        expect(badge).toHaveClass("bg-gray-100");
        expect(screen.queryByTestId("achievement-badge-sparkle")).not.toBeInTheDocument();
    });
});

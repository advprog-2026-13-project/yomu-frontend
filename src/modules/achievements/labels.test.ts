import { describe, it, expect } from "vitest";
import { achievementTypeLabel } from "./labels";

describe("achievementTypeLabel", () => {
    it("maps known types to friendly Indonesian labels", () => {
        expect(achievementTypeLabel("READING_COMPLETED")).toBe("Selesai Baca");
        expect(achievementTypeLabel("QUIZ_COMPLETED")).toBe("Selesai Kuis");
        expect(achievementTypeLabel("CLAN_REACHED_DIAMOND")).toBe("Liga Diamond");
    });

    it("title-cases unknown multi-underscore types with no leftover underscore", () => {
        expect(achievementTypeLabel("SOME_NEW_TYPE")).toBe("Some New Type");
        expect(achievementTypeLabel("SOME_NEW_TYPE")).not.toContain("_");
    });
});

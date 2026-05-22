import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthVisualPanel } from "./auth-visual-panel";
import { BookOpen } from "lucide-react";

describe("AuthVisualPanel", () => {
  it("renders with all slots", () => {
    render(
      <AuthVisualPanel
        illustrationIcon={<BookOpen data-testid="icon" />}
        socialProof={<div data-testid="social">Social</div>}
        floatingBadge={<div data-testid="badge">Badge</div>}
      />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByTestId("social")).toBeInTheDocument();
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });
});

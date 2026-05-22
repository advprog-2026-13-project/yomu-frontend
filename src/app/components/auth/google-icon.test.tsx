import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GoogleIcon } from "./google-icon";

describe("GoogleIcon", () => {
  it("renders svg element with correct viewBox", () => {
    const { container } = render(<GoogleIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("applies custom className", () => {
    const { container } = render(<GoogleIcon className="test-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("test-class");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthLayout from "./layout";

describe("AuthLayout", () => {
  it("renders children inside auth container", () => {
    render(
      <AuthLayout>
        <div data-testid="child">content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(document.querySelector(".auth-container")).toBeInTheDocument();
  });
});

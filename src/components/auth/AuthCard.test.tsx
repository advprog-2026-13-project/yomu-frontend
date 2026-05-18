import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AuthCard } from "./AuthCard";

describe("AuthCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders title and description", () => {
    render(
      <AuthCard
        title="Login"
        description="Sign in"
        footerText="No account?"
        footerLinkText="Register"
        footerLinkHref="/auth/register"
      >
        <form>content</form>
      </AuthCard>
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <AuthCard
        title="T"
        description="D"
        footerText="F"
        footerLinkText="L"
        footerLinkHref="/"
      >
        <input placeholder="test-input" />
      </AuthCard>
    );

    expect(screen.getByPlaceholderText("test-input")).toBeInTheDocument();
  });

  it("displays error alert when error is provided", () => {
    render(
      <AuthCard
        title="T"
        description="D"
        error="Something went wrong"
        footerText="F"
        footerLinkText="L"
        footerLinkHref="/"
      >
        <div />
      </AuthCard>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("does not display error alert when error is null", () => {
    render(
      <AuthCard
        title="T"
        description="D"
        error={null}
        footerText="F"
        footerLinkText="L"
        footerLinkHref="/"
      >
        <div />
      </AuthCard>
    );

    const alerts = screen.queryAllByRole("alert");
    expect(alerts).toHaveLength(0);
  });

  it("renders footer with navigation link", () => {
    const linkText = "Register here";
    render(
      <AuthCard
        title="T"
        description="D"
        footerText="No account?"
        footerLinkText={linkText}
        footerLinkHref="/auth/register"
      >
        <div />
      </AuthCard>
    );

    const link = screen.getByText(linkText);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/auth/register");
  });

  it("renders extras section", () => {
    render(
      <AuthCard
        title="T"
        description="D"
        footerText="F"
        footerLinkText="L"
        footerLinkHref="/"
        extras={<span>google-button</span>}
      >
        <div />
      </AuthCard>
    );

    expect(screen.getByText("google-button")).toBeInTheDocument();
  });
});

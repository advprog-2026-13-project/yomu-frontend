import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockLogin = vi.fn();
const mockLoginWithGoogle = vi.fn();
const mockClearError = vi.fn();

let mockAuthState = {
  login: mockLogin,
  loginWithGoogle: mockLoginWithGoogle,
  loading: false,
  error: null as string | null,
  clearError: mockClearError,
};

vi.mock("@/src/modules/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: vi.fn(() => <div data-testid="google-login" />),
}));

import LoginPage from "./page";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
      loading: false,
      error: null,
      clearError: mockClearError,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("renders login form", () => {
    render(<LoginPage />);

    expect(screen.getByText("Login Yomu")).toBeInTheDocument();
    expect(screen.getByText("Masuk ke akun kamu")).toBeInTheDocument();
    expect(screen.getByLabelText("Username or Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("renders registration link", () => {
    render(<LoginPage />);

    const link = screen.getByText("Daftar di sini");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/auth/register");
  });

  it("renders Google login section", () => {
    render(<LoginPage />);

    expect(screen.getByTestId("google-login")).toBeInTheDocument();
    expect(screen.getByText("atau")).toBeInTheDocument();
  });

  it("calls login on form submit", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Username or Email"), "testuser");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(mockClearError).toHaveBeenCalled();
    expect(mockLogin).toHaveBeenCalledWith({ identifier: "testuser", password: "password" });
  });

  it("shows loading state on button", () => {
    mockAuthState.loading = true;
    render(<LoginPage />);

    expect(screen.getByRole("button", { name: "Logging in..." })).toBeInTheDocument();
  });

  it("displays error alert when error is set", () => {
    mockAuthState.error = "Invalid credentials";
    render(<LoginPage />);

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("requires username and password fields", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("Username or Email")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
  });
});

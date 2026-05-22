import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cleanup } from "@testing-library/react";

const mockRegister = vi.fn();
const mockLoginWithGoogle = vi.fn();
const mockClearError = vi.fn();

let mockAuthState = {
  register: mockRegister,
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

import RegisterPage from "./page";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      register: mockRegister,
      loginWithGoogle: mockLoginWithGoogle,
      loading: false,
      error: null,
      clearError: mockClearError,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("renders register form with all fields", () => {
    render(<RegisterPage />);

    expect(screen.getByText("Yomu")).toBeInTheDocument();
    expect(screen.getByText("Mulai perjalanan literasimu")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama Lengkap")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email atau Nomor HP")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buat Akun" })).toBeInTheDocument();
  });

  it("renders login link", () => {
    render(<RegisterPage />);

    const link = screen.getByText("Masuk");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/auth/login");
  });

  it("renders Google login section", () => {
    render(<RegisterPage />);

    expect(screen.getByTestId("google-login")).toBeInTheDocument();
  });

  it("calls register on form submit", async () => {
    mockRegister.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Nama Lengkap"), "New User");
    await user.type(screen.getByLabelText("Username"), "newuser");
    await user.type(screen.getByLabelText("Email atau Nomor HP"), "new@mail.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Buat Akun" }));

    expect(mockClearError).toHaveBeenCalled();
    expect(mockRegister).toHaveBeenCalled();
  });

  it("sends null for empty optional fields", async () => {
    mockRegister.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Nama Lengkap"), "New User");
    await user.type(screen.getByLabelText("Username"), "newuser");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Buat Akun" }));

    expect(mockClearError).toHaveBeenCalled();
    expect(mockRegister).toHaveBeenCalled();
  });

  it("shows loading state on button", () => {
    mockAuthState.loading = true;
    render(<RegisterPage />);

    expect(screen.getByRole("button", { name: "Membuat akun..." })).toBeInTheDocument();
  });

  it("displays error alert when error is set", () => {
    mockAuthState.error = "Username taken";
    render(<RegisterPage />);

    expect(screen.getByText("Username taken")).toBeInTheDocument();
  });

  it("shows success alert after successful register", async () => {
    mockRegister.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Nama Lengkap"), "New User");
    await user.type(screen.getByLabelText("Username"), "newuser");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Buat Akun" }));

    await waitFor(() => {
      expect(screen.getByText(/Register success/)).toBeInTheDocument();
    });
  });

  it("requires nama lengkap, username, and password", () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText("Nama Lengkap")).toBeRequired();
    expect(screen.getByLabelText("Username")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
  });
});

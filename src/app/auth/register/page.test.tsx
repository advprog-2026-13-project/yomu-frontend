import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";

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

let googleCallbacks: { onSuccess?: (res: unknown) => void; onError?: () => void } = {};

vi.mock("@/src/modules/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: (props: Record<string, unknown>) => {
    googleCallbacks = { onSuccess: props.onSuccess as (res: unknown) => void, onError: props.onError as () => void };
    return <div data-testid="google-login" />;
  },
}));

import RegisterPage from "./page";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    googleCallbacks = {};
    mockAuthState = { register: mockRegister, loginWithGoogle: mockLoginWithGoogle, loading: false, error: null, clearError: mockClearError };
  });

  afterEach(() => cleanup());

  it("renders register form", () => {
    render(<RegisterPage />);
    expect(screen.getByTestId("google-login")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buat Akun" })).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockAuthState.loading = true;
    render(<RegisterPage />);
    expect(screen.getByRole("button", { name: "Membuat akun..." })).toBeInTheDocument();
  });

  it("displays error alert", () => {
    mockAuthState.error = "Username taken";
    render(<RegisterPage />);
    expect(screen.getByText("Username taken")).toBeInTheDocument();
  });

  it("calls loginWithGoogle on success", async () => {
    render(<RegisterPage />);
    googleCallbacks.onSuccess?.({ credential: "google-token" });
    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockLoginWithGoogle).toHaveBeenCalledWith("google-token");
    });
  });

  it("alerts on google error", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<RegisterPage />);
    googleCallbacks.onError?.();
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

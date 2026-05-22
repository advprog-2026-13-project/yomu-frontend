import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";

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

import LoginPage from "./page";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    googleCallbacks = {};
    mockAuthState = { login: mockLogin, loginWithGoogle: mockLoginWithGoogle, loading: false, error: null, clearError: mockClearError };
  });

  afterEach(() => cleanup());

  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByTestId("google-login")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockAuthState.loading = true;
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: "Masuk..." })).toBeInTheDocument();
  });

  it("displays error alert", () => {
    mockAuthState.error = "Invalid credentials";
    render(<LoginPage />);
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("calls loginWithGoogle on success with credential", async () => {
    render(<LoginPage />);
    googleCallbacks.onSuccess?.({ credential: "google-token" });
    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockLoginWithGoogle).toHaveBeenCalledWith("google-token");
    });
  });

  it("does not call loginWithGoogle when credential missing", async () => {
    render(<LoginPage />);
    googleCallbacks.onSuccess?.({});
    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockLoginWithGoogle).not.toHaveBeenCalled();
    });
  });

  it("alerts on google error", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<LoginPage />);
    googleCallbacks.onError?.();
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

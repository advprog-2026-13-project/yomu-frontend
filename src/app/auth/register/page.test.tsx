import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";

const mockRegister = vi.fn();
const mockLoginWithGoogle = vi.fn();
const mockClearError = vi.fn();

let mockAuthState = {
  register: mockRegister, loginWithGoogle: mockLoginWithGoogle,
  loading: false, error: null as string | null, clearError: mockClearError,
};

let googleCallbacks: { onSuccess?: (res: unknown) => void; onError?: () => void } = {};

vi.mock("@/src/modules/auth", () => ({ useAuth: () => mockAuthState }));
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
    mockRegister.mockResolvedValue(undefined);
    mockAuthState = { register: mockRegister, loginWithGoogle: mockLoginWithGoogle, loading: false, error: null, clearError: mockClearError };
  });
  afterEach(() => cleanup());

  it("renders form", () => {
    render(<RegisterPage />);
    expect(screen.getByTestId("google-login")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buat Akun" })).toBeInTheDocument();
  });

  it("submits register with required fields", async () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText("Nama Lengkap"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } });
    fireEvent.change(document.getElementById("password")!, { target: { value: "pass123" } });
    fireEvent.click(screen.getByRole("button", { name: "Buat Akun" }));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({ username: "testuser", displayName: "Test User", password: "pass123" })
      );
    });
  });

  it("shows loading", () => {
    mockAuthState.loading = true;
    render(<RegisterPage />);
    expect(screen.getByRole("button", { name: "Membuat akun..." })).toBeInTheDocument();
  });

  it("shows error", () => {
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

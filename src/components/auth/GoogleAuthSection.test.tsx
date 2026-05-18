import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GoogleAuthSection } from "./GoogleAuthSection";

const mockLoginWithGoogle = vi.fn();
const mockClearError = vi.fn();

const MockGoogleLogin = vi.fn();

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: (props: Record<string, unknown>) => {
    MockGoogleLogin(props);
    return <div data-testid="google-login" />;
  },
}));

vi.mock("@/src/modules/auth", () => ({
  useAuth: () => ({
    loginWithGoogle: mockLoginWithGoogle,
    clearError: mockClearError,
  }),
}));

describe("GoogleAuthSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders separator and Google login button", () => {
    render(<GoogleAuthSection />);

    expect(screen.getByText("atau")).toBeInTheDocument();
    expect(screen.getByTestId("google-login")).toBeInTheDocument();
  });

  it("passes text prop to GoogleLogin", () => {
    render(<GoogleAuthSection text="signup_with" />);

    expect(MockGoogleLogin).toHaveBeenCalledWith(
      expect.objectContaining({ text: "signup_with" })
    );
  });

  it("uses custom error handler when onError is provided", () => {
    const onError = vi.fn();
    render(<GoogleAuthSection onError={onError} />);

    const props = MockGoogleLogin.mock.calls[0][0];
    props.onError();

    expect(onError).toHaveBeenCalled();
  });

  it("alerts with custom error text when no onError handler", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<GoogleAuthSection errorText="Custom Error" />);

    const props = MockGoogleLogin.mock.calls[0][0];
    props.onError();

    expect(alertSpy).toHaveBeenCalledWith("Custom Error");
    alertSpy.mockRestore();
  });

  it("alerts default message when no onError and no errorText", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<GoogleAuthSection />);

    const props = MockGoogleLogin.mock.calls[0][0];
    props.onError();

    expect(alertSpy).toHaveBeenCalledWith("Google Login Failed");
    alertSpy.mockRestore();
  });

  it("calls loginWithGoogle when credential is present", async () => {
    render(<GoogleAuthSection />);

    const props = MockGoogleLogin.mock.calls[0][0];
    await props.onSuccess({ credential: "google-credential" });

    expect(mockClearError).toHaveBeenCalled();
    expect(mockLoginWithGoogle).toHaveBeenCalledWith("google-credential");
  });

  it("does not call loginWithGoogle when credential is missing", async () => {
    render(<GoogleAuthSection />);

    const props = MockGoogleLogin.mock.calls[0][0];
    await props.onSuccess({});

    expect(mockClearError).toHaveBeenCalled();
    expect(mockLoginWithGoogle).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "./useAuth";
import * as authApi from "../api";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("../api", async () => {
  const actual = await vi.importActual<typeof import("../api")>("../api");
  return { ...actual };
});

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockPush.mockClear();
  });

  describe("login", () => {
    it("stores token and redirects on success", async () => {
      vi.spyOn(authApi, "login").mockResolvedValue({ token: "jwt-token" });
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ identifier: "user", password: "pass" });
      });

      expect(authApi.getToken()).toBe("jwt-token");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(result.current.error).toBeNull();
    });

    it("sets error on failure", async () => {
      vi.spyOn(authApi, "login").mockRejectedValue(new Error("Invalid"));
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ identifier: "user", password: "wrong" });
      });

      expect(result.current.error).toBe("Invalid");
      expect(authApi.getToken()).toBeNull();
    });

    it("sets error when response has no token", async () => {
      vi.spyOn(authApi, "login").mockResolvedValue({});
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ identifier: "user", password: "pass" });
      });

      expect(result.current.error).toBe("Token not found in response");
    });
  });

  describe("register", () => {
    it("redirects to login on success", async () => {
      vi.spyOn(authApi, "register").mockResolvedValue({ token: "jwt" });
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({
          username: "new",
          displayName: "New",
          password: "pass",
        });
      });

      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });

    it("sets error on failure", async () => {
      vi.spyOn(authApi, "register").mockRejectedValue(new Error("Taken"));
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({
          username: "taken",
          displayName: "T",
          password: "p",
        });
      });

      expect(result.current.error).toBe("Taken");
    });
  });

  describe("loginWithGoogle", () => {
    it("stores token and redirects on success", async () => {
      vi.spyOn(authApi, "loginWithGoogle").mockResolvedValue({ token: "google-jwt" });
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.loginWithGoogle("credential");
      });

      expect(authApi.getToken()).toBe("google-jwt");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("sets error when token is missing", async () => {
      vi.spyOn(authApi, "loginWithGoogle").mockResolvedValue({});
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.loginWithGoogle("credential");
      });

      expect(result.current.error).toBe("Token not found in response");
    });
  });

  describe("logout", () => {
    it("clears token and redirects to login", () => {
      authApi.setToken("token");
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      expect(authApi.getToken()).toBeNull();
      expect(result.current.user).toBeNull();
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("fetchUser", () => {
    it("fetches and sets user when token exists", async () => {
      authApi.setToken("token");
      const user = { id: "1", username: "bob", displayName: "Bob", role: "USER" };
      vi.spyOn(authApi, "fetchUser").mockResolvedValue(user);
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.fetchUser();
      });

      expect(result.current.user).toEqual(user);
    });

    it("redirects to login when token is missing", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.fetchUser();
      });

      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });

    it("removes token and redirects on fetch error", async () => {
      authApi.setToken("token");
      vi.spyOn(authApi, "fetchUser").mockRejectedValue(new Error("Failed to fetch user"));
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.fetchUser();
      });

      expect(result.current.error).toBe("Failed to fetch user");
      expect(authApi.getToken()).toBeNull();
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("updateUser", () => {
    it("updates user on success", async () => {
      const updated = { id: "1", username: "new", displayName: "New", role: "USER" };
      vi.spyOn(authApi, "updateUser").mockResolvedValue(updated);
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.updateUser({
          username: "new",
          displayName: "New",
          email: "e@e.com",
          phoneNumber: "1",
        });
      });

      expect(result.current.user).toEqual(updated);
    });

    it("sets error on failure", async () => {
      vi.spyOn(authApi, "updateUser").mockRejectedValue(new Error("Failed to update profile"));
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.updateUser({
          username: "x",
          displayName: "x",
          email: "x",
          phoneNumber: "x",
        });
      });

      expect(result.current.error).toBe("Failed to update profile");
    });
  });

  describe("deleteUser", () => {
    it("clears token and redirects on success", async () => {
      authApi.setToken("token");
      vi.spyOn(authApi, "deleteUser").mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.deleteUser();
      });

      expect(authApi.getToken()).toBeNull();
      expect(mockPush).toHaveBeenCalledWith("/auth/register");
    });

    it("sets error on failure", async () => {
      vi.spyOn(authApi, "deleteUser").mockRejectedValue(new Error("Failed to delete account"));
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.deleteUser();
      });

      expect(result.current.error).toBe("Failed to delete account");
    });
  });

  describe("clearError", () => {
    it("clears the error state", async () => {
      vi.spyOn(authApi, "login").mockRejectedValue(new Error("Bad"));
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ identifier: "x", password: "x" });
      });
      expect(result.current.error).toBe("Bad");

      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe("auto-fetch", () => {
    it("fetches user automatically when token exists and user is null", async () => {
      authApi.setToken("token");
      const user = { id: "2", username: "alice", displayName: "Alice", role: "USER" };
      vi.spyOn(authApi, "fetchUser").mockResolvedValue(user);

      renderHook(() => useAuth());

      await vi.waitFor(() => {
        expect(authApi.fetchUser).toHaveBeenCalled();
      });
    });

    it("does not auto-fetch when no token", async () => {
      vi.spyOn(authApi, "fetchUser").mockResolvedValue({ id: "1", username: "b", displayName: "B", role: "USER" });

      renderHook(() => useAuth());

      await new Promise((r) => setTimeout(r, 100));
      expect(authApi.fetchUser).not.toHaveBeenCalled();
    });
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as authApi from "./api";

function mockFetch(response: unknown, status = 200, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
  });
}

describe("auth api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe("token management", () => {
    it("getToken returns null when not set", () => {
      expect(authApi.getToken()).toBeNull();
    });

    it("setToken and getToken round-trip", () => {
      authApi.setToken("my-token");
      expect(authApi.getToken()).toBe("my-token");
    });

    it("removeToken clears the token", () => {
      authApi.setToken("my-token");
      authApi.removeToken();
      expect(authApi.getToken()).toBeNull();
    });
  });

  describe("login", () => {
    it("returns AuthResponse on success", async () => {
      global.fetch = mockFetch({ token: "jwt-token" });

      const result = await authApi.login({ identifier: "user", password: "pass" });
      expect(result.token).toBe("jwt-token");
    });

    it("throws on error response", async () => {
      global.fetch = mockFetch({ message: "Invalid credentials" }, 401, false);

      await expect(
        authApi.login({ identifier: "user", password: "wrong" })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("register", () => {
    it("returns AuthResponse on success", async () => {
      global.fetch = mockFetch({ token: "jwt-token" });

      const result = await authApi.register({
        username: "newuser",
        displayName: "New User",
        email: "new@mail.com",
        phoneNumber: null,
        password: "pass123",
      });
      expect(result.token).toBe("jwt-token");
    });

    it("throws on error response", async () => {
      global.fetch = mockFetch({ message: "Username taken" }, 409, false);

      await expect(
        authApi.register({
          username: "taken",
          displayName: "Taken",
          password: "pass",
        })
      ).rejects.toThrow("Username taken");
    });
  });

  describe("loginWithGoogle", () => {
    it("sends google token and returns AuthResponse", async () => {
      global.fetch = mockFetch({ token: "google-jwt" });

      const result = await authApi.loginWithGoogle("google-credential");
      expect(result.token).toBe("google-jwt");
    });

    it("throws on error", async () => {
      global.fetch = mockFetch({ message: "Invalid Google token" }, 401, false);

      await expect(authApi.loginWithGoogle("bad-token")).rejects.toThrow("Invalid Google token");
    });
  });

  describe("fetchUser", () => {
    it("returns User with auth header", async () => {
      authApi.setToken("my-token");
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: "1", username: "bob", displayName: "Bob", role: "USER" }),
      });
      global.fetch = fetchMock;

      const user = await authApi.fetchUser();
      expect(user.username).toBe("bob");
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer my-token" }),
      }));
    });

    it("returns empty user when response is not ok", async () => {
      global.fetch = mockFetch({}, 500, false);

      await expect(authApi.fetchUser()).rejects.toThrow("Request failed with status 500");
    });
  });

  describe("updateUser", () => {
    it("sends PATCH with auth header", async () => {
      authApi.setToken("my-token");
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "1",
          username: "newbob",
          displayName: "New Bob",
          role: "USER",
        }),
      });
      global.fetch = fetchMock;

      const input = {
        username: "newbob",
        displayName: "New Bob",
        email: "bob@mail.com",
        phoneNumber: "0812",
      };
      const user = await authApi.updateUser(input);
      expect(user.username).toBe("newbob");
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({ Authorization: "Bearer my-token" }),
      }));
    });
  });

  describe("deleteUser", () => {
    it("sends DELETE with auth header", async () => {
      authApi.setToken("my-token");
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      });
      global.fetch = fetchMock;

      const result = await authApi.deleteUser();
      expect(result).toBeUndefined();
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", expect.objectContaining({
        method: "DELETE",
      }));
    });

    it("throws on error", async () => {
      authApi.setToken("my-token");
      global.fetch = mockFetch({ message: "Forbidden" }, 403, false);

      await expect(authApi.deleteUser()).rejects.toThrow("Forbidden");
    });
  });

  describe("request helper edge cases", () => {
    it("handles non-JSON error response gracefully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Not JSON");
        },
      });

      await expect(authApi.fetchUser()).rejects.toThrow("Request failed with status 500");
    });

    it("handles fetch network errors", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(authApi.login({ identifier: "u", password: "p" })).rejects.toThrow(
        "Network error"
      );
    });
  });
});

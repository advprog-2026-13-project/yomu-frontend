import { describe, it, expect, beforeEach, vi } from "vitest";
import * as authApi from "./api";

function mockFetch(response: unknown, status = 200, ok = true) {
  return vi.fn().mockResolvedValue({ ok, status, json: async () => response });
}

describe("auth api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

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

  it("login returns token on success", async () => {
    global.fetch = mockFetch({ accessToken: "jwt" });
    const result = await authApi.login({ identifier: "u", password: "p" });
    expect(result.accessToken).toBe("jwt");
  });

  it("login throws on error", async () => {
    global.fetch = mockFetch({ message: "Invalid" }, 401, false);
    await expect(authApi.login({ identifier: "u", password: "p" })).rejects.toThrow("Invalid");
  });

  it("register returns response on success", async () => {
    global.fetch = mockFetch({ token: "jwt" });
    const result = await authApi.register({ username: "u", displayName: "U", password: "p" });
    expect(result.token).toBe("jwt");
  });

  it("loginWithGoogle sends credential", async () => {
    global.fetch = mockFetch({ accessToken: "google-jwt" });
    const result = await authApi.loginWithGoogle("cred");
    expect(result.accessToken).toBe("google-jwt");
  });

  it("fetchUser sends auth header", async () => {
    authApi.setToken("tok");
    const fm = vi.fn().mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ id: "1", username: "b", displayName: "B", role: "USER" }),
    });
    global.fetch = fm;

    const user = await authApi.fetchUser();
    expect(user.username).toBe("b");
    expect(fm).toHaveBeenCalledWith("/api/auth/me", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer tok" }),
    }));
  });

  it("updateUser sends PATCH with body", async () => {
    authApi.setToken("tok");
    global.fetch = mockFetch({ id: "1", username: "x", displayName: "X", role: "USER" });

    const input = { username: "x", displayName: "X", email: "e@e.com", phoneNumber: "1" };
    const user = await authApi.updateUser(input);
    expect(user.username).toBe("x");
  });

  it("deleteUser calls DELETE endpoint", async () => {
    authApi.setToken("tok");
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => ({}) });

    const result = await authApi.deleteUser();
    expect(result).toBeUndefined();
  });

  it("handles non-JSON error gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 500,
      json: async () => { throw new Error("Not JSON"); },
    });
    await expect(authApi.fetchUser()).rejects.toThrow("Request failed with status 500");
  });
});

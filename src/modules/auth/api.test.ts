import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getToken, setToken, removeToken } from "./api";

describe("auth API token management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("getToken returns null when no token", () => {
    expect(getToken()).toBeNull();
  });

  it("setToken stores token in localStorage", () => {
    setToken("test-token");
    expect(localStorage.getItem("token")).toBe("test-token");
  });

  it("getToken returns token after setToken", () => {
    setToken("test-token");
    expect(getToken()).toBe("test-token");
  });

  it("removeToken removes token from localStorage", () => {
    setToken("test-token");
    removeToken();
    expect(getToken()).toBeNull();
  });
});

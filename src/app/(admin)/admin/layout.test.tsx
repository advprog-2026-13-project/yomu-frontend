import { describe, it, expect, vi } from "vitest";

vi.mock("@/src/modules/auth/api", () => ({
  getToken: vi.fn(() => "fake-token"),
  fetchUser: vi.fn(() => Promise.resolve({ role: "ADMIN" })),
  removeToken: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin",
}));

describe("AdminLayout", () => {
  it("exists and exports default", async () => {
    const mod = await import("./layout");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

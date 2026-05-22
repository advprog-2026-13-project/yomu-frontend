import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";

const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock("@/src/modules/auth/api", () => ({
  getToken: () => "fake-token",
  fetchUser: () => Promise.resolve({ id: "1", username: "admin", displayName: "Admin", role: "ADMIN" }),
  removeToken: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  usePathname: () => "/admin",
}));

import AdminLayout from "./layout";

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without crashing", async () => {
    const { container } = render(<AdminLayout><div>test</div></AdminLayout>);
    await waitFor(() => {
      expect(container.textContent).toContain("Yomu Admin");
    });
  });

  it("shows loading state initially", () => {
    const { container } = render(<AdminLayout><div>test</div></AdminLayout>);
    expect(container.textContent).toContain("Loading");
  });

  it("renders children after auth", async () => {
    const { container } = render(<AdminLayout><div data-testid="child">Content</div></AdminLayout>);
    await waitFor(() => {
      expect(container.textContent).toContain("Users");
    });
  });
});

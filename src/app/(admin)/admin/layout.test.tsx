import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/src/modules/auth/api", () => ({
  getToken: vi.fn(() => "fake-token"),
  fetchUser: vi.fn(() => Promise.resolve({ role: "ADMIN" })),
  removeToken: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin",
}));

import AdminLayout from "./layout";

describe("AdminLayout", () => {
  it("renders without crashing", () => {
    render(<AdminLayout><div>Content</div></AdminLayout>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});

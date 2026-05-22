import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockFetchUsers = vi.fn(() => Promise.resolve([
  { id: "u-1", username: "admin", displayName: "Admin User", role: "ADMIN" },
  { id: "u-2", username: "testuser", displayName: "Test User", role: "USER" },
]));

vi.mock("@/src/modules/admin/api", () => ({
  fetchUsers: () => mockFetchUsers(),
  promoteUser: vi.fn(() => Promise.resolve()),
  demoteUser: vi.fn(() => Promise.resolve()),
}));

import UsersPage from "./page";

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(<UsersPage />);
    expect(screen.getByText(/loading users/i)).toBeInTheDocument();
  });

  it("calls fetchUsers on mount", () => {
    render(<UsersPage />);
    expect(mockFetchUsers).toHaveBeenCalled();
  });

  it("renders title", () => {
    render(<UsersPage />);
    expect(screen.getAllByText("User Management").length).toBeGreaterThan(0);
  });

  it("renders refresh button", () => {
    render(<UsersPage />);
    expect(screen.getAllByRole("button", { name: /refresh/i }).length).toBeGreaterThan(0);
  });
});

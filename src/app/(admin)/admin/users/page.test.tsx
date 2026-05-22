import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";

vi.mock("@/src/modules/admin/api", () => ({
  fetchUsers: vi.fn(() => Promise.resolve([])),
  promoteUser: vi.fn(),
  demoteUser: vi.fn(),
}));

import UsersPage from "./page";

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without crashing", async () => {
    const { container } = render(<UsersPage />);
    await waitFor(() => {
      expect(container.textContent).toBeTruthy();
    });
  });
});

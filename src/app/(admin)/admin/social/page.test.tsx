import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";

vi.mock("@/src/modules/social/api", () => ({
  adminGetClans: vi.fn(() => Promise.resolve([])),
  adminGetClanMembers: vi.fn(() => Promise.resolve([])),
  adminRemoveMember: vi.fn(),
  adminDeleteClan: vi.fn(),
  adminGetJoinRequests: vi.fn(() => Promise.resolve([])),
  endSeason: vi.fn(),
}));

import AdminSocialPage from "./page";

describe("AdminSocialPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without crashing", async () => {
    const { container } = render(<AdminSocialPage />);
    await waitFor(() => {
      expect(container.textContent).toBeTruthy();
    });
  });
});

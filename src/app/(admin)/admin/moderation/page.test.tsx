import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";

vi.mock("@/src/modules/admin/api", () => ({
  deleteForumComment: vi.fn(),
}));

import ForumPage from "./page";

describe("ForumPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without crashing", () => {
    const { container } = render(<ForumPage />);
    expect(container.textContent).toBeTruthy();
  });
});

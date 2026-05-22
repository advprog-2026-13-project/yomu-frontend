import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";

vi.mock("@/src/modules/admin/api", () => ({
  fetchReadings: vi.fn(() => Promise.resolve([])),
  fetchQuestions: vi.fn(() => Promise.resolve([])),
  createReading: vi.fn(),
  updateReading: vi.fn(),
  deleteReading: vi.fn(),
  createQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  deleteQuestion: vi.fn(),
}));

import ReadingsPage from "./page";

describe("ReadingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without crashing", async () => {
    const { container } = render(<ReadingsPage />);
    await waitFor(() => {
      expect(container.textContent).toBeTruthy();
    });
  });
});

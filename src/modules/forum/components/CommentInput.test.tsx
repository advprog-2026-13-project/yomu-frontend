import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { CommentInput } from "./CommentInput";

describe("CommentInput", () => {
  afterEach(() => {
    cleanup();
  });

  it("submits trimmed value and clears", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <CommentInput
        id="comment-input"
        placeholder="Write..."
        onSubmit={onSubmit}
        loading={false}
      />
    );

    const textarea = screen.getByPlaceholderText("Write...");
    fireEvent.change(textarea, { target: { value: "  hello  " } });

    const form = textarea.closest("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("hello");
      expect(textarea).toHaveValue("");
    });
  });

  it("submits on Enter key press", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <CommentInput
        id="comment-input"
        placeholder="Write..."
        onSubmit={onSubmit}
        loading={false}
      />
    );

    const textarea = screen.getByPlaceholderText("Write...");
    fireEvent.change(textarea, { target: { value: "Hi" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("Hi");
    });
  });

  it("calls onCancel when provided", () => {
    const onCancel = vi.fn();
    const { container } = render(
      <CommentInput
        id="comment-input"
        placeholder="Write..."
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onCancel={onCancel}
        loading={false}
      />
    );

    const cancelButton = container.querySelector('button[type="button"]');
    if (!cancelButton) throw new Error("Cancel button not found");

    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalled();
  });
});

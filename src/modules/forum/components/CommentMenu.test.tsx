import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CommentMenu } from "./CommentMenu";

describe("CommentMenu", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders edit and delete actions when opened", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const { container } = render(
      <CommentMenu commentId="c1" onEdit={onEdit} onDelete={onDelete} />
    );

    const toggle = container.querySelector("#comment-menu-c1");
    if (!toggle) throw new Error("Menu toggle not found");

    fireEvent.click(toggle);

    fireEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalled();

    fireEvent.click(toggle);
    fireEvent.click(screen.getByText("Hapus"));
    expect(onDelete).toHaveBeenCalled();
  });

  it("closes when clicking outside", () => {
    const { container } = render(
      <CommentMenu commentId="c2" onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    const toggle = container.querySelector("#comment-menu-c2");
    if (!toggle) throw new Error("Menu toggle not found");

    fireEvent.click(toggle);
    expect(screen.getByText("Edit")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("renders nothing when both actions are disabled", () => {
    const { container } = render(
      <CommentMenu commentId="c3" allowEdit={false} allowDelete={false} />
    );

    expect(container.firstChild).toBeNull();
  });
});

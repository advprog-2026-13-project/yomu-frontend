import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ReactionBar } from "./ReactionBar";

describe("ReactionBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders existing reactions and calls onReact", () => {
    const onReact = vi.fn();
    render(
      <ReactionBar
        commentId="c1"
        reactionCounts={{ UPVOTE: 2, EMOJI_LAUGH: 1 }}
        onReact={onReact}
      />
    );

    const upvoteButton = screen.getByTitle("Suka");
    fireEvent.click(upvoteButton);

    expect(onReact).toHaveBeenCalledWith("c1", "UPVOTE");
  });

  it("opens picker and selects a reaction", () => {
    const onReact = vi.fn();
    render(
      <ReactionBar
        commentId="c2"
        reactionCounts={{}}
        onReact={onReact}
      />
    );

    fireEvent.click(screen.getByTitle("Tambah reaksi"));
    const loveOption = screen.getByTitle("Love");
    fireEvent.click(loveOption);

    expect(onReact).toHaveBeenCalledWith("c2", "EMOJI_LIKE");
  });

  it("closes picker on outside click", () => {
    render(
      <ReactionBar
        commentId="c3"
        reactionCounts={{}}
        onReact={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTitle("Tambah reaksi"));
    expect(screen.getByTitle("Love")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByTitle("Love")).not.toBeInTheDocument();
  });
});

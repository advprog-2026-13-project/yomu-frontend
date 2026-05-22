import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { ForumReadingCard } from "./ForumReadingCard";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ForumReadingCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders active badge and link", () => {
    render(
      <ForumReadingCard
        readingId="r1"
        title="Reading"
        category="Sains"
        commentCount={3}
        rank={1}
      />
    );

    expect(screen.getByText("Reading")).toBeInTheDocument();
    expect(screen.getByText("Aktif")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/forum/r1");
  });

  it("renders empty state badge when no comments", () => {
    render(
      <ForumReadingCard
        readingId="r2"
        title="Empty Reading"
        category="Sosial"
        commentCount={0}
        rank={5}
      />
    );

    expect(screen.getByText("Belum ada diskusi")).toBeInTheDocument();
    expect(screen.getByText("Sosial")).toBeInTheDocument();
  });
});

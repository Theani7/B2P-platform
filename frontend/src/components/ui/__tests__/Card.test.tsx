import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "../Card";

describe("Card", () => {
  test("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  test("renders with default padding (md = p-5)", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("p-5");
  });

  test("applies sm padding", () => {
    render(<Card padding="sm">Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("p-4");
  });

  test("applies lg padding", () => {
    render(<Card padding="lg">Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("p-6");
  });

  test("applies none padding", () => {
    render(<Card padding="none">Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).not.toContain("p-");
  });

  test("merges custom className", () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("custom-class");
  });

  test("renders with base styling classes", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("bg-white");
    expect(card.className).toContain("rounded-cards");
    expect(card.className).toContain("border");
    expect(card.className).toContain("border-slate-custom/10");
  });

  test("renders complex children", () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
      </Card>,
    );
    expect(screen.getByRole("heading", { name: /title/i })).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });
});

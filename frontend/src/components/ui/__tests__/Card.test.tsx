import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "../Card";

describe("Card", () => {
  test("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  test("renders with default padding class", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content").className).toContain("p-6");
  });

  test("applies custom padding", () => {
    render(<Card padding="p-4">Content</Card>);
    expect(screen.getByText("Content").className).toContain("p-4");
    expect(screen.getByText("Content").className).not.toContain("p-6");
  });

  test("merges custom className", () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("custom-class");
    expect(card.className).toContain("bg-white");
    expect(card.className).toContain("rounded-xl");
  });

  test("renders with base styling classes", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("bg-white");
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("border");
    expect(card.className).toContain("border-gray-200");
    expect(card.className).toContain("shadow-sm");
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

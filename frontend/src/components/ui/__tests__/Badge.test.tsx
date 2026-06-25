import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  test("renders children", () => {
    render(<Badge variant="active">Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  test("renders a span element", () => {
    render(<Badge variant="active">Tag</Badge>);
    expect(screen.getByText("Tag").tagName).toBe("SPAN");
  });

  test("applies active variant styles", () => {
    render(<Badge variant="active">Active</Badge>);
    const badge = screen.getByText("Active");
    expect(badge.className).toContain("bg-brand-purple-50");
    expect(badge.className).toContain("text-brand-purple-900");
  });

  test("applies verified variant styles", () => {
    render(<Badge variant="verified">Verified</Badge>);
    const badge = screen.getByText("Verified");
    expect(badge.className).toContain("bg-brand-teal-50");
    expect(badge.className).toContain("text-brand-teal-900");
  });

  test("applies pending variant styles", () => {
    render(<Badge variant="pending">Pending</Badge>);
    const badge = screen.getByText("Pending");
    expect(badge.className).toContain("bg-brand-amber-50");
    expect(badge.className).toContain("text-brand-amber-900");
  });

  test("applies completed variant styles", () => {
    render(<Badge variant="completed">Completed</Badge>);
    const badge = screen.getByText("Completed");
    expect(badge.className).toContain("bg-green-50");
    expect(badge.className).toContain("text-green-800");
  });

  test("applies rejected variant styles", () => {
    render(<Badge variant="rejected">Rejected</Badge>);
    const badge = screen.getByText("Rejected");
    expect(badge.className).toContain("bg-brand-coral-50");
    expect(badge.className).toContain("text-brand-coral-900");
  });

  test("applies draft variant styles", () => {
    render(<Badge variant="draft">Draft</Badge>);
    const badge = screen.getByText("Draft");
    expect(badge.className).toContain("bg-gray-100");
    expect(badge.className).toContain("text-gray-500");
  });

  test("merges custom className", () => {
    render(<Badge variant="active" className="custom-class">Custom</Badge>);
    expect(screen.getByText("Custom").className).toContain("custom-class");
  });

  test("includes base classes", () => {
    render(<Badge variant="active">Base</Badge>);
    const badge = screen.getByText("Base");
    expect(badge.className).toContain("inline-flex");
    expect(badge.className).toContain("rounded");
    expect(badge.className).toContain("text-[11px]");
    expect(badge.className).toContain("font-medium");
  });
});

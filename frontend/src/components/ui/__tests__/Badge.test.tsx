import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "../Badge";

describe("Badge", () => {
  test("renders children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  test("renders a span element", () => {
    render(<Badge>Tag</Badge>);
    expect(screen.getByText("Tag").tagName).toBe("SPAN");
  });

  test("applies default variant styles", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-gray-100");
    expect(badge.className).toContain("text-gray-700");
  });

  test("applies success variant styles", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge.className).toContain("bg-green-100");
    expect(badge.className).toContain("text-green-700");
  });

  test("applies warning variant styles", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText("Warning");
    expect(badge.className).toContain("bg-yellow-100");
    expect(badge.className).toContain("text-yellow-700");
  });

  test("applies danger variant styles", () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText("Danger");
    expect(badge.className).toContain("bg-red-100");
    expect(badge.className).toContain("text-red-700");
  });

  test("applies info variant styles", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge.className).toContain("bg-blue-100");
    expect(badge.className).toContain("text-blue-700");
  });

  test("merges custom className", () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText("Custom").className).toContain("custom-class");
  });

  test("includes base classes for all variants", () => {
    render(<Badge>Base</Badge>);
    const badge = screen.getByText("Base");
    expect(badge.className).toContain("inline-flex");
    expect(badge.className).toContain("rounded-full");
    expect(badge.className).toContain("text-xs");
    expect(badge.className).toContain("font-medium");
  });
});

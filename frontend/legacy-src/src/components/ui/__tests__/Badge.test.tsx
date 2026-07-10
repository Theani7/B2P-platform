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
    expect(badge.className).toContain("bg-emerald-status/10");
    expect(badge.className).toContain("text-emerald-status");
  });

  test("applies verified variant styles", () => {
    render(<Badge variant="verified">Verified</Badge>);
    const badge = screen.getByText("Verified");
    expect(badge.className).toContain("bg-emerald-status/10");
    expect(badge.className).toContain("text-emerald-status");
  });

  test("applies pending variant styles", () => {
    render(<Badge variant="pending">Pending</Badge>);
    const badge = screen.getByText("Pending");
    expect(badge.className).toContain("bg-amber-tag/10");
    expect(badge.className).toContain("text-amber-tag");
  });

  test("applies completed variant styles", () => {
    render(<Badge variant="completed">Completed</Badge>);
    const badge = screen.getByText("Completed");
    expect(badge.className).toContain("bg-emerald-status/10");
    expect(badge.className).toContain("text-emerald-status");
  });

  test("applies rejected variant styles", () => {
    render(<Badge variant="rejected">Rejected</Badge>);
    const badge = screen.getByText("Rejected");
    expect(badge.className).toContain("bg-coral-alert/10");
    expect(badge.className).toContain("text-coral-alert");
  });

  test("applies draft variant styles", () => {
    render(<Badge variant="draft">Draft</Badge>);
    const badge = screen.getByText("Draft");
    expect(badge.className).toContain("bg-slate-custom/10");
    expect(badge.className).toContain("text-slate-custom");
  });

  test("merges custom className", () => {
    render(<Badge variant="active" className="custom-class">Custom</Badge>);
    expect(screen.getByText("Custom").className).toContain("custom-class");
  });

  test("includes base classes", () => {
    render(<Badge variant="active">Base</Badge>);
    const badge = screen.getByText("Base");
    expect(badge.className).toContain("inline-flex");
    expect(badge.className).toContain("rounded-badges");
    expect(badge.className).toContain("text-xs");
    expect(badge.className).toContain("font-medium");
  });
});

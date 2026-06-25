import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  test("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  test("applies default variant and size classes", () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-primary");
    expect(btn.className).toContain("px-4 py-2");
  });

  test("applies variant classes", () => {
    const { rerender } = render(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole("button").className).toContain("bg-danger");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button").className).toContain("bg-gray-100");

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button").className).toContain("bg-transparent");

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button").className).toContain("bg-transparent");
  });

  test("applies size classes", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button").className).toContain("px-3 py-1.5");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button").className).toContain("px-6 py-3");
  });

  test("disables button when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
  });

  test("disables button when loading is true", () => {
    render(<Button loading>Loading</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
  });

  test("shows spinner and sr-only text when loading", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  test("merges custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button").className).toContain("custom-class");
  });

  test("passes additional HTML attributes", () => {
    render(<Button data-testid="my-btn">Test</Button>);
    expect(screen.getByTestId("my-btn")).toBeInTheDocument();
  });

  test("renders with focus ring classes", () => {
    render(<Button>Focus</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("focus:outline-none");
    expect(btn.className).toContain("focus:ring-2");
  });
});

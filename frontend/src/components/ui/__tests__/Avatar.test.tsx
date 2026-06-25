import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "../Avatar";

describe("Avatar", () => {
  test("renders initials", () => {
    render(<Avatar initials="AB" />);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  test("renders a div element", () => {
    const { container } = render(<Avatar initials="AB" />);
    expect(container.firstChild!.nodeName).toBe("DIV");
  });

  test("applies default size (md)", () => {
    const { container } = render(<Avatar initials="AB" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("w-9");
    expect(el.className).toContain("h-9");
    expect(el.className).toContain("text-xs");
  });

  test("applies sm size", () => {
    const { container } = render(<Avatar initials="AB" size="sm" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("w-7");
    expect(el.className).toContain("h-7");
    expect(el.className).toContain("text-[10px]");
  });

  test("applies lg size", () => {
    const { container } = render(<Avatar initials="AB" size="lg" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("w-16");
    expect(el.className).toContain("h-16");
    expect(el.className).toContain("text-xl");
  });

  test("applies default color (index 0)", () => {
    const { container } = render(<Avatar initials="AB" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-brand-purple-50");
    expect(el.className).toContain("text-brand-purple-900");
  });

  test("applies color by index", () => {
    const { container } = render(<Avatar initials="AB" colorIndex={1} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-brand-teal-50");
    expect(el.className).toContain("text-brand-teal-900");
  });

  test("wraps color index modulo 5", () => {
    const { container } = render(<Avatar initials="AB" colorIndex={7} />);
    const el = container.firstChild as HTMLElement;
    // 7 % 5 = 2 → brand-amber
    expect(el.className).toContain("bg-brand-amber-50");
  });

  test("merges custom className", () => {
    const { container } = render(<Avatar initials="AB" className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  test("applies rounded-full for circular shape", () => {
    const { container } = render(<Avatar initials="AB" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded-full");
  });

  test("applies font-medium", () => {
    const { container } = render(<Avatar initials="AB" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("font-medium");
  });
});

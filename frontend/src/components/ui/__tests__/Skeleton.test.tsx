import { test, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "../Skeleton";

describe("Skeleton", () => {
  test("renders with default variant (text) and classes", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("animate-pulse");
    expect(el.className).toContain("bg-slate-custom/10");
    expect(el.className).toContain("h-4");
    expect(el.className).toContain("w-full");
    expect(el.className).toContain("rounded");
  });

  test("applies circular variant", () => {
    const { container } = render(<Skeleton variant="circular" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded-full");
  });

  test("applies rectangular variant", () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).not.toContain("rounded-full");
    expect(el.className).not.toContain("h-4");
    expect(el.className).not.toContain("w-full");
    expect(el.className).not.toContain("rounded");
  });

  test("sets width and height via style", () => {
    const { container } = render(<Skeleton width={200} height={100} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("200px");
    expect(el.style.height).toBe("100px");
  });

  test("sets width and height as string", () => {
    const { container } = render(<Skeleton width="50%" height="3rem" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("50%");
    expect(el.style.height).toBe("3rem");
  });

  test("marks element as aria-hidden", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  test("merges custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

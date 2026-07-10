import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScorePill } from "../ScorePill";

describe("ScorePill", () => {
  test("renders score value", () => {
    render(<ScorePill score={85} />);
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  test("renders a span element", () => {
    render(<ScorePill score={85} />);
    expect(screen.getByText("85").tagName).toBe("SPAN");
  });

  test("applies emerald styling for score >= 85", () => {
    render(<ScorePill score={90} />);
    const pill = screen.getByText("90");
    expect(pill.className).toContain("bg-emerald-status/10");
    expect(pill.className).toContain("text-emerald-status");
  });

  test("applies amber styling for score 70-84", () => {
    render(<ScorePill score={75} />);
    const pill = screen.getByText("75");
    expect(pill.className).toContain("bg-amber-tag/10");
    expect(pill.className).toContain("text-amber-tag");
  });

  test("applies neutral styling for score < 70", () => {
    render(<ScorePill score={50} />);
    const pill = screen.getByText("50");
    expect(pill.className).toContain("bg-sky-wash");
    expect(pill.className).toContain("text-ash");
  });

  test("applies emerald styling at exact threshold of 85", () => {
    render(<ScorePill score={85} />);
    const pill = screen.getByText("85");
    expect(pill.className).toContain("bg-emerald-status/10");
  });

  test("applies amber styling at exact threshold of 70", () => {
    render(<ScorePill score={70} />);
    const pill = screen.getByText("70");
    expect(pill.className).toContain("bg-amber-tag/10");
  });

  test("applies base styling classes", () => {
    render(<ScorePill score={80} />);
    const pill = screen.getByText("80");
    expect(pill.className).toContain("rounded-badges");
    expect(pill.className).toContain("px-1.5");
    expect(pill.className).toContain("py-0.5");
    expect(pill.className).toContain("text-xs");
    expect(pill.className).toContain("font-medium");
  });

  test("merges custom className", () => {
    render(<ScorePill score={80} className="custom-class" />);
    expect(screen.getByText("80").className).toContain("custom-class");
  });
});

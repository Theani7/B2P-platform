import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "../StatCard";

describe("StatCard", () => {
  test("renders label and value", () => {
    render(<StatCard label="Total Users" value={1234} />);
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });

  test("renders string value", () => {
    render(<StatCard label="Status" value="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  test("renders subtitle when provided", () => {
    render(<StatCard label="Revenue" value="$10k" subtitle="this month" />);
    expect(screen.getByText("this month")).toBeInTheDocument();
  });

  test("does not render subtitle when not provided", () => {
    render(<StatCard label="Revenue" value="$10k" />);
    expect(screen.queryByText("this month")).not.toBeInTheDocument();
  });

  test("renders positive trend", () => {
    render(<StatCard label="Users" value={100} trend={{ value: "+12%", positive: true }} />);
    const trend = screen.getByText("+12%");
    expect(trend).toBeInTheDocument();
    expect(trend.className).toContain("text-brand-teal");
  });

  test("renders negative trend", () => {
    render(<StatCard label="Users" value={100} trend={{ value: "-5%", positive: false }} />);
    const trend = screen.getByText("-5%");
    expect(trend).toBeInTheDocument();
    expect(trend.className).toContain("text-brand-coral");
  });

  test("does not render trend when not provided", () => {
    render(<StatCard label="Users" value={100} />);
    expect(screen.queryByText("+12%")).not.toBeInTheDocument();
  });

  test("applies base styling classes", () => {
    const { container } = render(<StatCard label="Label" value="Value" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-white");
    expect(el.className).toContain("border");
    expect(el.className).toContain("border-gray-100");
    expect(el.className).toContain("rounded-xl");
    expect(el.className).toContain("p-5");
  });

  test("merges custom className", () => {
    const { container } = render(<StatCard label="Label" value="Value" className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  test("renders label with uppercase tracking styling", () => {
    render(<StatCard label="Metric" value={42} />);
    const label = screen.getByText("Metric");
    expect(label.className).toContain("text-[11px]");
    expect(label.className).toContain("uppercase");
    expect(label.className).toContain("tracking-wide");
    expect(label.className).toContain("text-gray-400");
  });
});

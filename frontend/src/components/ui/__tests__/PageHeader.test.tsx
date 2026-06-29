import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "../PageHeader";
import { Button } from "../Button";

describe("PageHeader", () => {
  test("renders title as h1", () => {
    render(<PageHeader title="Dashboard" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Dashboard");
  });

  test("renders description when provided", () => {
    render(<PageHeader title="Dashboard" description="Welcome back" />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  test("does not render description when not provided", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.queryByText("Welcome back")).not.toBeInTheDocument();
  });

  test("renders actions when provided", () => {
    render(
      <PageHeader
        title="Dashboard"
        actions={<Button>Create</Button>}
      />,
    );
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  test("does not render actions container when not provided", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  test("renders title with text-xl and font-medium styling", () => {
    render(<PageHeader title="Title" />);
    const heading = screen.getByRole("heading");
    expect(heading.className).toContain("text-xl");
    expect(heading.className).toContain("font-medium");
  });

  test("renders description with gray text", () => {
    render(<PageHeader title="Title" description="Desc" />);
    expect(screen.getByText("Desc").className).toContain("text-ash");
  });
});

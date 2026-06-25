import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Label from "../Label";

describe("Label", () => {
  test("renders children", () => {
    render(<Label>Username</Label>);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  test("renders a label element", () => {
    render(<Label>Username</Label>);
    expect(screen.getByText("Username").tagName).toBe("LABEL");
  });

  test("applies default class names", () => {
    render(<Label>Username</Label>);
    const label = screen.getByText("Username");
    expect(label.className).toContain("block");
    expect(label.className).toContain("text-sm");
    expect(label.className).toContain("font-medium");
    expect(label.className).toContain("text-gray-700");
  });

  test("merges custom className", () => {
    render(<Label className="custom-class">Username</Label>);
    expect(screen.getByText("Username").className).toContain("custom-class");
  });

  test("passes htmlFor attribute", () => {
    render(<Label htmlFor="username-input">Username</Label>);
    expect(screen.getByText("Username")).toHaveAttribute("for", "username-input");
  });

  test("passes additional HTML attributes", () => {
    render(<Label data-testid="my-label">Username</Label>);
    expect(screen.getByTestId("my-label")).toBeInTheDocument();
  });

  test("renders complex children", () => {
    render(
      <Label>
        <span>Required</span>
      </Label>,
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});

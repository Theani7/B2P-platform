import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "../Input";

describe("Input", () => {
  test("renders input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  test("uses label to generate id when no id provided", () => {
    render(<Input label="Full Name" />);
    const input = screen.getByLabelText("Full Name");
    expect(input).toHaveAttribute("id", "full-name");
  });

  test("uses provided id over generated one", () => {
    render(<Input label="Email" id="custom-id" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "custom-id");
  });

  test("renders error message and sets aria-invalid", () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  test("renders helper text when no error", () => {
    render(<Input label="Email" helperText="Enter your email" />);
    expect(screen.getByText("Enter your email")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("shows error over helper text when both provided", () => {
    render(<Input label="Email" error="Required" helperText="Enter your email" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.queryByText("Enter your email")).not.toBeInTheDocument();
  });

  test("associates error with input via aria-describedby", () => {
    render(<Input label="Email" error="Required" />);
    const input = screen.getByLabelText("Email");
    const errorId = input.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toHaveTextContent("Required");
  });

  test("calls onChange when value changes", () => {
    const onChange = vi.fn();
    render(<Input label="Name" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("renders without label", () => {
    render(<Input placeholder="No label" />);
    expect(screen.getByPlaceholderText("No label")).toBeInTheDocument();
  });

  test("merges custom className", () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole("textbox").className).toContain("custom-class");
  });

  test("applies error border class", () => {
    render(<Input error="Error" />);
    expect(screen.getByRole("textbox").className).toContain("border-brand-coral");
  });

  test("applies default border class", () => {
    render(<Input />);
    expect(screen.getByRole("textbox").className).toContain("border-gray-200");
  });

  test("sets aria-describedby for helper text", () => {
    render(<Input label="Email" helperText="Enter your email" />);
    const input = screen.getByLabelText("Email");
    const helperId = input.getAttribute("aria-describedby");
    expect(helperId).toBeTruthy();
    expect(document.getElementById(helperId!)).toHaveTextContent("Enter your email");
  });
});

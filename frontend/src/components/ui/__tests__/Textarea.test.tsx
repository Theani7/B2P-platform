import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Textarea } from "../Textarea";

describe("Textarea", () => {
  test("renders textarea element", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("renders with label", () => {
    render(<Textarea label="Description" />);
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  test("uses label to generate id when no id provided", () => {
    render(<Textarea label="Description" />);
    const textarea = screen.getByLabelText("Description");
    expect(textarea).toHaveAttribute("id", "description");
  });

  test("uses provided id over generated one", () => {
    render(<Textarea label="Description" id="custom-id" />);
    const textarea = screen.getByLabelText("Description");
    expect(textarea).toHaveAttribute("id", "custom-id");
  });

  test("renders error message and sets aria-invalid", () => {
    render(<Textarea label="Description" error="Required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    const textarea = screen.getByLabelText("Description");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  test("associates error with textarea via aria-describedby", () => {
    render(<Textarea label="Description" error="Required" />);
    const textarea = screen.getByLabelText("Description");
    const errorId = textarea.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toHaveTextContent("Required");
  });

  test("calls onChange when value changes", () => {
    const onChange = vi.fn();
    render(<Textarea label="Description" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Hello" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("renders without label", () => {
    render(<Textarea placeholder="No label" />);
    expect(screen.getByPlaceholderText("No label")).toBeInTheDocument();
  });

  test("merges custom className", () => {
    render(<Textarea className="custom-class" />);
    expect(screen.getByRole("textbox").className).toContain("custom-class");
  });

  test("applies error border class", () => {
    render(<Textarea error="Error" />);
    expect(screen.getByRole("textbox").className).toContain("border-brand-coral");
  });

  test("applies default border class", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox").className).toContain("border-gray-200");
  });
});

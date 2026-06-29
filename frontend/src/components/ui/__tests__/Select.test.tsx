import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "../Select";

const options = [
  { value: "1", label: "Option One" },
  { value: "2", label: "Option Two" },
  { value: "3", label: "Option Three" },
];

describe("Select", () => {
  test("renders with label and options", () => {
    render(<Select label="Category" options={options} />);
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Option One")).toBeInTheDocument();
    expect(screen.getByText("Option Two")).toBeInTheDocument();
    expect(screen.getByText("Option Three")).toBeInTheDocument();
  });

  test("renders placeholder as disabled option", () => {
    render(<Select label="Category" options={options} placeholder="Select..." />);
    const placeholderOption = screen.getByText("Select...");
    expect(placeholderOption).toBeInTheDocument();
    expect(placeholderOption).toHaveAttribute("disabled");
  });

  test("does not render placeholder when not provided", () => {
    render(<Select label="Category" options={options} />);
    expect(screen.queryByText("Select...")).not.toBeInTheDocument();
  });

  test("renders error message and sets aria-invalid", () => {
    render(<Select label="Category" options={options} error="Required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  test("renders helper text when no error", () => {
    render(<Select label="Category" options={options} helperText="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("shows error over helper text when both provided", () => {
    render(<Select label="Category" options={options} error="Required" helperText="Pick one" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.queryByText("Pick one")).not.toBeInTheDocument();
  });

  test("calls onChange when selection changes", () => {
    const onChange = vi.fn();
    render(<Select label="Category" options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("uses custom id", () => {
    render(<Select label="Category" options={options} id="custom-id" />);
    const select = screen.getByLabelText("Category");
    expect(select).toHaveAttribute("id", "custom-id");
  });

  test("merges custom className", () => {
    render(<Select label="Category" options={options} className="custom-class" />);
    expect(screen.getByRole("combobox").className).toContain("custom-class");
  });

  test("applies error border class", () => {
    render(<Select label="Category" options={options} error="Error" />);
    expect(screen.getByRole("combobox").className).toContain("border-coral-alert");
  });

  test("applies default border class", () => {
    render(<Select label="Category" options={options} />);
    expect(screen.getByRole("combobox").className).toContain("border-slate-custom/10");
  });
});

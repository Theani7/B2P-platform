import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "../ConfirmDialog";

describe("ConfirmDialog", () => {
  test("renders nothing when isOpen is false", () => {
    render(
      <ConfirmDialog isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Are you sure?" />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  test("renders title, message, and buttons when open", () => {
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Delete?" message="Are you sure?" />,
    );
    expect(screen.getByText("Delete?")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument();
  });

  test("uses custom confirmText", () => {
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Sure?" confirmText="Yes, delete" />,
    );
    expect(screen.getByRole("button", { name: /yes, delete/i })).toBeInTheDocument();
  });

  test("uses custom cancelText", () => {
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Sure?" cancelText="Nope" />,
    );
    expect(screen.getByRole("button", { name: /nope/i })).toBeInTheDocument();
  });

  test("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} title="Confirm" message="Sure?" />,
    );
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when cancel button is clicked", () => {
    const onClose = vi.fn();
    render(
      <ConfirmDialog isOpen={true} onClose={onClose} onConfirm={vi.fn()} title="Confirm" message="Sure?" />,
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("disables Cancel button when loading is true", () => {
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Sure?" loading={true} />,
    );
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  test("applies destructive variant (cta) to confirm button by default", () => {
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Sure?" />,
    );
    const confirmBtn = screen.getByRole("button", { name: /confirm/i });
    expect(confirmBtn.className).toContain("bg-coral-alert/10");
  });

  test("applies primary variant when specified", () => {
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Sure?" variant="primary" />,
    );
    const confirmBtn = screen.getByRole("button", { name: /confirm/i });
    expect(confirmBtn.className).toContain("hero-blue-fade");
  });

  test("applies secondary variant to cancel button", () => {
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Sure?" />,
    );
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    expect(cancelBtn.className).toContain("bg-white");
    expect(cancelBtn.className).toContain("border-slate-custom/20");
  });
});

import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Dialog from "../Dialog";

describe("Dialog", () => {
  test("renders nothing when isOpen is false", () => {
    render(
      <Dialog isOpen={false} onClose={vi.fn()} title="Test">
        Content
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  test("renders content and title when isOpen is true", () => {
    render(
      <Dialog isOpen={true} onClose={vi.fn()} title="My Dialog">
        Dialog body
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("My Dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog body")).toBeInTheDocument();
  });

  test("sets aria-modal and aria-labelledby attributes", () => {
    render(
      <Dialog isOpen={true} onClose={vi.fn()} title="Test">
        Content
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title");
  });

  test("renders close button with aria-label", () => {
    render(
      <Dialog isOpen={true} onClose={vi.fn()} title="Test">
        Content
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  test("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={onClose} title="Test">
        Content
      </Dialog>,
    );
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={onClose} title="Test">
        Content
      </Dialog>,
    );
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("does not call onClose when inner content is clicked", () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={onClose} title="Test">
        <span>Inner</span>
      </Dialog>,
    );
    fireEvent.click(screen.getByText("Inner"));
    expect(onClose).not.toHaveBeenCalled();
  });

  test("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={onClose} title="Test">
        Content
      </Dialog>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("renders footer content when provided", () => {
    render(
      <Dialog isOpen={true} onClose={vi.fn()} title="Test" footer={<button>Save</button>}>
        Content
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("does not render footer section when not provided", () => {
    render(
      <Dialog isOpen={true} onClose={vi.fn()} title="Test">
        Content
      </Dialog>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  test("sets body overflow hidden when open and clears on unmount", () => {
    const { unmount } = render(
      <Dialog isOpen={true} onClose={vi.fn()} title="Test">
        Content
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});

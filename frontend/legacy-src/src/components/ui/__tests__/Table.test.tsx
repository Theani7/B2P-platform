import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Table } from "../Table";

interface User {
  name: string;
  email: string;
  role: string;
}

const columns = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
];

const data: User[] = [
  { name: "Alice", email: "alice@test.com", role: "Admin" },
  { name: "Bob", email: "bob@test.com", role: "User" },
];

describe("Table", () => {
  test("renders column headers", () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
  });

  test("renders data rows", () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("bob@test.com")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  test("renders empty state when data is empty", () => {
    render(<Table columns={columns} data={[]} />);
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  test("renders custom empty message", () => {
    render(<Table columns={columns} data={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  test("renders loading skeleton rows", () => {
    const { container } = render(<Table columns={columns} data={[]} loading={true} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(columns.length * 5);
  });

  test("calls onRowClick when a row is clicked", () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} data={data} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  test("does not call onRowClick when not provided", () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} data={data} />);
    fireEvent.click(screen.getByText("Alice"));
    expect(onRowClick).not.toHaveBeenCalled();
  });

  test("renders with custom render function", () => {
    const cols = [
      { key: "name", header: "Name", render: (item: User) => <strong>{item.name}</strong> },
    ];
    render(<Table columns={cols} data={data} />);
    const strong = screen.getByText("Alice");
    expect(strong.tagName).toBe("STRONG");
  });

  test("applies row cursor style when onRowClick is provided", () => {
    render(<Table columns={columns} data={data} onRowClick={vi.fn()} />);
    const aliceRow = screen.getByText("Alice").closest("tr");
    expect(aliceRow?.className).toContain("cursor-pointer");
  });

  test("applies rounded-cards to wrapper", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    const wrapper = container.querySelector(".overflow-x-auto");
    expect(wrapper?.className).toContain("rounded-cards");
  });
});

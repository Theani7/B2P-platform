import { test, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "../Login";

test("renders login form and shows validation errors", async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </QueryClientProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: /login/i }));
  await waitFor(() => {
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 character/i)).toBeInTheDocument();
  });

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "invalid-email" } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "short" } });
  fireEvent.click(screen.getByRole("button", { name: /login/i }));
  await waitFor(() => {
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 character/i)).toBeInTheDocument();
  });
});

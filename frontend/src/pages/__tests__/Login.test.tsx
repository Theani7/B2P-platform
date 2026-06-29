import { test, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../providers/AuthProvider";
import Login from "../LoginPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

test("renders login form and shows validation errors", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
  await waitFor(() => {
    expect(screen.getByText(/email is required/i)).toBeInTheDocument() ||
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });
});
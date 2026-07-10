import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../providers/AuthProvider";
import BusinessProfilePage from "../BusinessProfilePage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

test("renders business profile form with heading and save button", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProfilePage />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>,
  );

  expect(await screen.findByRole("button", { name: /save profile/i })).toBeInTheDocument();
  expect(screen.getByText(/company name/i)).toBeInTheDocument();
  expect(screen.getByText(/industry/i)).toBeInTheDocument();
});

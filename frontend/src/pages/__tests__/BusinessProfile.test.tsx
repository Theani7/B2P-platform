import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BusinessProfilePage from "../BusinessProfilePage";

test("renders business profile form with heading and save button", () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <BusinessProfilePage />
      </BrowserRouter>
    </QueryClientProvider>,
  );

  expect(screen.getByRole("button", { name: /save profile/i })).toBeInTheDocument();
  expect(screen.getByText(/company name/i)).toBeInTheDocument();
  expect(screen.getByText(/industry/i)).toBeInTheDocument();
});

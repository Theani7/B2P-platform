import { test, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreateCampaignPage from "../CreateCampaignPage";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
  );
}

test("renders create campaign form with heading and submit button", () => {
  renderWithProviders(<CreateCampaignPage />);
  expect(screen.getByRole("heading", { name: /create campaign/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /create campaign/i })).toBeInTheDocument();
});

test("shows validation errors for empty required fields on submit", async () => {
  renderWithProviders(<CreateCampaignPage />);
  fireEvent.click(screen.getByRole("button", { name: /create campaign/i }));
  await waitFor(() => {
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description must be at least 20 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/category is required/i)).toBeInTheDocument();
    expect(screen.getByText(/location is required/i)).toBeInTheDocument();
    expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
  });
});

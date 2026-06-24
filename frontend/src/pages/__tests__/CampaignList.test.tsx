import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CampaignListPage from "../CampaignListPage";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
  );
}

test("renders campaign list page with heading and create button", () => {
  renderWithProviders(<CampaignListPage />);
  expect(screen.getByText("Campaigns")).toBeInTheDocument();
  expect(screen.getByText(/new campaign/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/search campaigns/i)).toBeInTheDocument();
});

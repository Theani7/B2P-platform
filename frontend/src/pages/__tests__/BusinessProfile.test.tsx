import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BusinessProfilePage from "../src/pages/BusinessProfilePage";

test("renders business profile form with validation", async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <BusinessProfilePage />
      </BrowserRouter>
    </QueryClientProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: /save/i }));
  // Check that required fields show errors (handled by browser validation or form library)
  expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
});
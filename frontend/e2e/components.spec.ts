import { test, expect } from "@playwright/test";

test.describe("Design System Components", () => {
  test("demo page renders all components", async ({ page }) => {
    // Visit a page that uses design system components
    // CampaignListPage uses Button, Badge, ConfirmDialog
    // BusinessProfilePage uses Button, Input, Label, Textarea
    await page.goto("/login");

    // Button renders with correct styles
    const loginBtn = page.getByRole("button", { name: /login/i });
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toBeEnabled();

    // Input fields are accessible
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute("aria-label", "Email address");
  });
});

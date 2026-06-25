import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("renders login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/email/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
    await expect(page.getByText(/remember me/i)).toBeVisible();
  });

  test("shows validation errors on empty login submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page.getByText(/invalid email/i)).toBeVisible();
    await expect(page.getByText(/at least 8 character/i)).toBeVisible();
  });

  test("renders register page", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText(/username/i).first()).toBeVisible();
    await expect(page.getByText(/full name/i).first()).toBeVisible();
    await expect(page.getByText(/email/i).first()).toBeVisible();
    await expect(page.getByText(/^password$/i).first()).toBeVisible();
    await expect(page.getByText(/confirm password/i)).toBeVisible();
    await expect(page.getByText("Business", { exact: true })).toBeVisible();
    await expect(page.getByText("Promoter", { exact: true })).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/business/dashboard");
    await page.waitForURL("/login");
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
  });

  test("navigates from login to register", async ({ page }) => {
    await page.goto("/login");
    await page.getByText(/register/i).click();
    await page.waitForURL("/register");
    await expect(page.getByText(/create account/i)).toBeVisible();
  });
});

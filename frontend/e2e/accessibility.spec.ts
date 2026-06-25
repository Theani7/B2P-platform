import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility audit", () => {
  const pages = [
    { path: "/login", name: "Login" },
    { path: "/register", name: "Register" },
  ];

  for (const { path, name } of pages) {
    test(`${name} page has no critical accessibility violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page }).analyze();

      expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
    });
  }

  test("homepage redirects to login for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("/login");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
  });
});

import { test, expect } from "@playwright/test";

test.describe("home", () => {
  test("shows feed heading and news block (mocked API)", async ({ page }) => {
    await page.route("**/api/v1/auth/me**", async (route) => {
      await route.fulfill({ status: 401, body: "{}" });
    });
    await page.route("**/api/v1/post/posts**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ posts: [], total: 0 }),
      });
    });
    await page.route("**/api/v1/news/top**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              title: "E2E mock headline",
              url: "https://example.com/e2e",
              source: "E2E",
              publishedAt: "2025-01-01T00:00:00Z",
            },
          ],
          total: 1,
        }),
      });
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: /home feed/i })).toBeVisible();
    await expect(page.getByText("E2E mock headline")).toBeVisible();
  });
});

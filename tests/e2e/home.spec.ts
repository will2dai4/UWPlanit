import { expect, test } from "@playwright/test";

test("renders the foundation shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /bootstrap the uwplanit product shell before feature work begins/i,
    }),
  ).toBeVisible();
});

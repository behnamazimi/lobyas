import { test, expect } from "../fixtures";
import { gotoReady } from "../support/navigation";
import { SAMPLE_TERMS, seedCollection } from "../support/seed";

test.describe("Status and empty states", () => {
  test("a missing page offers a way home and to Browse", async ({ page, user }) => {
    void user;
    const response = await page.goto("/app/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "We can’t find that page" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse collections" })).toHaveAttribute(
      "href",
      "/app/browse",
    );
    await page.getByRole("link", { name: "Go home" }).click();
    await expect(page).toHaveURL(/\/app\/?$/);
  });

  test("nothing left to read opens the collection switcher", async ({ page, user }) => {
    await seedCollection(user, SAMPLE_TERMS.slice(0, 1), "Quiet terms");
    await gotoReady(page, "/app/read");
    await page.getByRole("button", { name: "Show definition" }).click();
    await page.getByRole("button", { name: "Mark as known" }).click();
    await expect(
      page.getByRole("heading", { name: "Nothing left to read here right now" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Switch collection" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("link", { name: "Add terms" })).toHaveAttribute(
      "href",
      "/app/import",
    );
  });
});

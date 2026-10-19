import { test, expect } from "../fixtures";
import { creditsLeft } from "../support/credits";
import { gotoReady } from "../support/navigation";

test.describe("Settings", () => {
  test("the AI credits balance matches what the account holds", async ({ page, user }) => {
    await gotoReady(page, "/app/settings");
    const left = await creditsLeft(user.id);

    await expect(page.getByText(new RegExp(`${left} of \\d+ credits left`))).toBeVisible();
  });

  test("a member can sign out", async ({ page, user: _user }) => {
    await gotoReady(page, "/app/me");
    await page.getByRole("button", { name: "Log out" }).click();

    await expect(page).toHaveURL(/\/($|login)/);
    await page.goto("/app/library");
    await expect(page).toHaveURL(/\/login/);
  });
});

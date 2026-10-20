import { test, expect } from "../fixtures";
import { gotoReady } from "../support/navigation";
import { SAMPLE_TERMS, seedCollection } from "../support/seed";

test.describe("App shell", () => {
  test(
    "the four destinations are in the tab bar on a phone and the rail on a desktop",
    { tag: "@smoke" },
    async ({ page, user, isMobile }) => {
      await seedCollection(user);
      await gotoReady(page, "/app");
      const nav = page.getByRole("navigation", { name: "Main" });
      await expect(nav).toHaveCount(1);

      for (const label of ["Library", "Goals", "Me", "Home"]) {
        await nav.getByRole("link", { name: label, exact: true }).click();
        const path = label === "Home" ? /\/app\/?$/ : new RegExp(`/app/${label.toLowerCase()}`);
        await expect(page).toHaveURL(path);
      }

      await gotoReady(page, "/app/read");
      await expect(page).toHaveURL(/\/app\/read/);
      await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(isMobile ? 0 : 1);
    },
  );

  test(
    "Me lists the account actions and the theme survives a reload",
    { tag: "@smoke" },
    async ({ page, user }) => {
      void user;
      await gotoReady(page, "/app/me");
      await expect(page.getByRole("link", { name: "Mastery" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Browse" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Add a collection" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Report an issue" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();

      await page
        .getByRole("radiogroup", { name: "Theme" })
        .getByText("Dim", { exact: true })
        .click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dim");
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dim");
    },
  );

  test(
    "the collection chosen in the Library is the one Read opens, unless the link says otherwise",
    { tag: "@smoke" },
    async ({ page, user, isMobile }) => {
      const alpha = await seedCollection(user, SAMPLE_TERMS, "Alpha terms");
      const beta = await seedCollection(user, SAMPLE_TERMS.slice(0, 3), "Beta terms");
      await gotoReady(page, "/app/library");

      if (isMobile) {
        await page.getByRole("button", { name: /^Collection / }).click();
      } else {
        // The rail's switcher button comes before the rows it lists.
        await page
          .getByRole("button", { name: /(Alpha|Beta) terms/ })
          .first()
          .click();
      }
      await page.getByRole("button", { name: new RegExp(`^${beta.name}`) }).click();
      await expect(page).toHaveURL(new RegExp(`collection=${beta.collectionId}`));

      await gotoReady(page, "/app/read");
      await expect(page).toHaveURL(new RegExp(`collection=${beta.collectionId}`));

      await gotoReady(page, `/app/read?collection=${alpha.collectionId}`);
      await expect(page).toHaveURL(new RegExp(`collection=${alpha.collectionId}`));

      await gotoReady(page, "/app/read?collection=all");
      await expect(page).toHaveURL(new RegExp(`collection=${alpha.collectionId}`));
    },
  );
});

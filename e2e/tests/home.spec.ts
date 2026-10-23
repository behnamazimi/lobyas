import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures";
import { gotoReady } from "../support/navigation";
import { setCollectionGoals } from "../support/goals";
import { seedCollection } from "../support/seed";

test.describe("Home", () => {
  test(
    "with goals, Home shows progress and Continue opens the next open goal",
    { tag: "@smoke" },
    async ({ page, user, isMobile }) => {
      const { name, collectionId } = await seedCollection(user);
      await setCollectionGoals(user.id, collectionId, { read: 10, review: 20, quiz: 10 });
      await gotoReady(page, "/app");

      await expect(
        page.getByText("0 of 3 goals met").locator("visible=true").first(),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Read, 0 of 10 today, 10 unread" }),
      ).toBeVisible();
      await expect(
        isMobile
          ? page.getByRole("button", { name: `${name}, switch collection` })
          : page.getByRole("heading", { level: 1, name }),
      ).toBeVisible();

      await page.getByRole("link", { name: "Continue", exact: true }).click();
      await expect(page).toHaveURL(/\/app\/read/);
    },
  );

  // Every prefetch is a server render, so Home only warms the tabs and the next step.
  test("Home prefetches only the nav tabs and Continue", async ({ page, user }) => {
    const { collectionId } = await seedCollection(user);
    await setCollectionGoals(user.id, collectionId, { read: 10, review: 20, quiz: 10 });
    const prefetched = new Set<string>();
    page.on("request", (request) => {
      if (request.headers()["next-router-prefetch"]) {
        prefetched.add(new URL(request.url()).pathname);
      }
    });
    await gotoReady(page, "/app");

    const allowed = ["/app", "/app/goals", "/app/library", "/app/me", "/app/read"];
    expect([...prefetched].filter((path) => !allowed.includes(path))).toEqual([]);
    expect(prefetched).toContain("/app/read");
  });

  test(
    "without goals, Home still offers a place to start and a way to set a pace",
    { tag: "@smoke" },
    async ({ page, user }) => {
      await seedCollection(user);
      await gotoReady(page, "/app");

      await expect(
        page.getByText("Any stop is a fine place to begin").locator("visible=true").first(),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /^Start here/ }).first()).toBeVisible();
      await expect(page.getByRole("link", { name: "Set a daily goal" })).toBeVisible();
      await expect(page.getByText(/\b(due|overdue)\b/i)).toHaveCount(0);
    },
  );

  test(
    "switching collection changes Home and survives a reload",
    { tag: "@smoke" },
    async ({ page, user, isMobile, baseURL }) => {
      const suffix = randomUUID().slice(0, 6);
      const first = await seedCollection(user, undefined, `Alpha ${suffix}`);
      const second = await seedCollection(user, undefined, `Bravo ${suffix}`);
      await page
        .context()
        .addCookies([{ name: "lb_lib_collection", value: first.collectionId, url: baseURL ?? "" }]);
      await gotoReady(page, "/app");

      const title = (name: string) =>
        isMobile
          ? page.getByRole("button", { name: `${name}, switch collection` })
          : page.getByRole("heading", { level: 1, name });
      await expect(title(first.name)).toBeVisible();

      const opener = isMobile
        ? page.getByRole("button", { name: `${first.name}, switch collection` })
        : page.locator("aside").getByRole("button", { name: first.name });
      await opener.click();
      await page.getByRole("button", { name: new RegExp(`^${second.name}`) }).click();
      await expect(title(second.name)).toBeVisible();

      await page.reload();
      await expect(title(second.name)).toBeVisible();
    },
  );
});

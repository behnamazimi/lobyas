import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures";
import { sql } from "../support/db";
import { gotoReady } from "../support/navigation";
import { seedCollection } from "../support/seed";

async function storedGoals(userId: string) {
  const [row] = await sql<{ daily_goals: Record<string, number | null> | null }>(
    "select daily_goals from public.user_settings where user_id = $1",
    [userId],
  );
  return row?.daily_goals ?? null;
}

async function gradeGood(page: Page, times: number) {
  for (let i = 0; i < times; i++) {
    await page.getByRole("button", { name: /^Recall the meaning/ }).click();
    await page.getByRole("button", { name: /^Good/ }).click();
  }
}

test.describe("Daily goals", () => {
  test(
    "a member sets goals and meeting one celebrates it",
    { tag: "@smoke" },
    async ({ page, user }) => {
      const { collectionId } = await seedCollection(user);
      await gotoReady(page, "/app");
      const nav = page.getByRole("navigation", { name: "Main" });
      await nav.getByRole("link", { name: "Goals" }).click();
      await expect(page).toHaveURL(/\/app\/goals/);

      await page
        .getByRole("group", { name: "Review pace" })
        .getByRole("button", { name: "Light" })
        .click();
      await page
        .getByRole("heading", { name: "Review" })
        .locator("..")
        .locator("..")
        .getByRole("button", { name: "Fewer terms a day" })
        .click();
      await page.getByRole("button", { name: "Start these goals" }).click();
      await expect.poll(() => storedGoals(user.id)).toEqual({ read: 20, review: 5, quiz: 10 });

      await gotoReady(page, `/app/review?collection=${collectionId}`);
      await gradeGood(page, 5);

      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("heading", { name: "Review goal met!" })).toBeVisible();
      await dialog.getByRole("link", { name: /^Go to Quiz/ }).click();
      await expect(page).toHaveURL(/\/app\/quiz/);
    },
  );

  test("Done for today closes the celebration and goes Home", async ({ page, user }) => {
    const { collectionId } = await seedCollection(user);
    await sql(
      `insert into public.user_settings (user_id, daily_goals)
       values ($1, '{"read": null, "review": 1, "quiz": null}')
       on conflict (user_id) do update set daily_goals = excluded.daily_goals`,
      [user.id],
    );
    await gotoReady(page, `/app/review?collection=${collectionId}`);
    await gradeGood(page, 1);
    await page.getByRole("dialog").getByRole("button", { name: "Done for today" }).click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test("a quiz goal celebrates on the results, not mid-quiz", async ({ page, user }) => {
    const { collectionId } = await seedCollection(user);
    await sql(
      `insert into public.user_settings (user_id, daily_goals)
       values ($1, '{"read": null, "review": null, "quiz": 1}')
       on conflict (user_id) do update set daily_goals = excluded.daily_goals`,
      [user.id],
    );
    await gotoReady(page, `/app/quiz?collection=${collectionId}`);
    await page.getByRole("radio", { name: "5", exact: true }).click({ force: true });
    await page.getByRole("button", { name: "Start quiz" }).click();

    const choices = page.getByRole("radiogroup", { name: "Answer choices" });
    const results = page.getByRole("heading", { name: /\d+ of \d+ right/ });
    const celebration = page.getByRole("dialog").getByRole("heading", { name: /goals? met!$/ });
    // An answer is saved when the quiz moves on, so answer one and go to the next.
    await choices.locator("label").first().click();
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByText(/^Question 2 of/)).toBeVisible();
    await expect
      .poll(async () => {
        const [row] = await sql<{ count: string }>(
          "select count(*) as count from public.review_state where user_id = $1 and quiz_test_count > 0",
          [user.id],
        );
        return Number(row!.count);
      })
      .toBeGreaterThan(0);
    // Give the claim, and a retry, time to land before checking nothing opened.
    await page.waitForTimeout(2000);
    await expect(celebration).toBeHidden();

    // A wrong answer queues a retry, so the quiz can run past five questions.
    for (let answered = 0; answered < 10; answered++) {
      await choices.locator("label").first().click();
      await page.getByRole("button", { name: "Check", exact: true }).click();
      await page.getByRole("button", { name: /^(Next|See results)$/ }).click();
      await expect(results.or(choices)).toBeVisible();
      if (await results.isVisible()) break;
    }
    await expect(results).toBeVisible();
    await expect(celebration).toBeVisible();
  });

  test("a read goal celebrates on the next card's front, not its back", async ({ page, user }) => {
    const { collectionId } = await seedCollection(user);
    await sql(
      `insert into public.user_settings (user_id, daily_goals)
       values ($1, '{"read": 1, "review": null, "quiz": null}')
       on conflict (user_id) do update set daily_goals = excluded.daily_goals`,
      [user.id],
    );
    await gotoReady(page, `/app/read?collection=${collectionId}&view=cards`);
    const celebration = page.getByRole("dialog").getByRole("heading", { name: /goals? met!$/ });

    await page.getByRole("button", { name: /^Show definition/ }).click();
    await expect
      .poll(async () => {
        const [row] = await sql<{ count: string }>(
          "select count(*) as count from public.review_state where user_id = $1 and read_count > 0",
          [user.id],
        );
        return Number(row!.count);
      })
      .toBeGreaterThan(0);
    // Give the claim, and a retry, time to land before checking nothing opened.
    await page.waitForTimeout(2000);
    await expect(celebration).toBeHidden();

    await page.getByRole("button", { name: /^Next term/ }).click();
    await expect(celebration).toBeVisible();
  });

  test("the last goal of the day celebrates once", async ({ page, user }) => {
    const { collectionId } = await seedCollection(user);
    await sql(
      `insert into public.user_settings (user_id, daily_goals)
       values ($1, '{"read": null, "review": 1, "quiz": null}')
       on conflict (user_id) do update set daily_goals = excluded.daily_goals`,
      [user.id],
    );

    await gotoReady(page, `/app/review?collection=${collectionId}`);
    await gradeGood(page, 1);
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Today’s goals met!" })).toBeVisible();
    await dialog.getByRole("button", { name: "Keep going" }).click();
    await expect(dialog).toBeHidden();

    const toast = page.getByText("Review goal met. Keep going as long as you like.");
    await expect(toast).toBeHidden();
    await gotoReady(page, `/app/review?collection=${collectionId}`);
    await expect(toast).toBeVisible();
    await gradeGood(page, 1);
    await expect
      .poll(async () => {
        const [row] = await sql<{ count: string }>(
          "select count(distinct term_id) as count from public.review_events where user_id = $1 and grade is not null",
          [user.id],
        );
        return Number(row!.count);
      })
      .toBe(2);
    // A claim runs after the grade is saved and may retry 2 s later, so give
    // a second dialog the time it would need to show up before checking.
    await page.waitForTimeout(3000);
    await expect(page.getByRole("dialog")).toBeHidden();
    const [settings] = await sql<{ goal_celebrated: { tiers: string[] } }>(
      "select goal_celebrated from public.user_settings where user_id = $1",
      [user.id],
    );
    expect(settings?.goal_celebrated.tiers).toEqual(["review"]);
  });
});

test("the reminders card is only for the phone apps", async ({ page }) => {
  await gotoReady(page, "/app/goals");
  await expect(page.getByRole("heading", { name: "Goals" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reminders" })).toHaveCount(0);
});

import { test, expect } from "../fixtures";
import { sql } from "../support/db";
import { gotoReady } from "../support/navigation";
import { SAMPLE_TERMS, seedCollection } from "../support/seed";

const FIRST_TERM = [...SAMPLE_TERMS].map((t) => t.term).sort()[0]!; // Backpressure, as the library lists A to Z

async function markedKnown(userId: string, term: string): Promise<boolean> {
  const rows = await sql(
    `select 1 from public.review_state rs join public.terms t on t.id = rs.term_id
     where rs.user_id = $1 and t.term = $2 and rs.marked_known_at is not null`,
    [userId, term],
  );
  return rows.length > 0;
}

test.describe("Managing the library", () => {
  test(
    "marking a term known can be undone",
    { tag: "@smoke" },
    async ({ page, user, isMobile }) => {
      test.skip(isMobile, "Phones mark known by swiping a row");
      const { collectionId } = await seedCollection(user);
      await gotoReady(page, `/app/library?collection=${collectionId}`);
      const row = page.getByRole("article").filter({ hasText: FIRST_TERM });

      await row.getByRole("button", { name: "Mark known" }).click();
      await expect(page.getByText(`Marked "${FIRST_TERM}" known`)).toBeVisible();
      await expect.poll(() => markedKnown(user.id, FIRST_TERM)).toBe(true);

      await page.getByRole("button", { name: "Undo" }).click();
      await expect.poll(() => markedKnown(user.id, FIRST_TERM)).toBe(false);
    },
  );

  test("a known term stays known after a reload", async ({ page, user, isMobile }) => {
    test.skip(isMobile, "Phones mark known by swiping a row");
    const { collectionId } = await seedCollection(user);
    await gotoReady(page, `/app/library?collection=${collectionId}`);
    const row = page.getByRole("article").filter({ hasText: FIRST_TERM });
    await row.getByRole("button", { name: "Mark known" }).click();
    await expect.poll(() => markedKnown(user.id, FIRST_TERM)).toBe(true);

    await page.reload();
    await expect(
      page
        .getByRole("article")
        .filter({ hasText: FIRST_TERM })
        .getByRole("button", { name: "Mark unknown" }),
    ).toBeVisible();
  });

  test(
    "deleting a term removes it from the collection",
    { tag: "@smoke" },
    async ({ page, user }) => {
      const { collectionId } = await seedCollection(user);
      await gotoReady(page, `/app/library?collection=${collectionId}`);

      await page.getByRole("button", { name: `Actions for ${FIRST_TERM}` }).click();
      await page.getByRole("button", { name: "Delete term" }).click();
      await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();

      await expect(page.getByRole("article").filter({ hasText: FIRST_TERM })).toHaveCount(0);
      await expect
        .poll(
          async () =>
            (await sql("select 1 from public.terms where collection_id = $1", [collectionId]))
              .length,
        )
        .toBe(SAMPLE_TERMS.length - 1);
    },
  );

  test("the owner can say a collection holds words and phrases", async ({ page, user }) => {
    const { collectionId } = await seedCollection(user);
    await gotoReady(page, `/app/library?collection=${collectionId}`);

    await page.getByRole("button", { name: "More", exact: true }).click();
    await page.getByRole("button", { name: "Edit collection" }).click();
    const dialog = page.getByRole("dialog", { name: "Edit collection" });
    await expect(dialog.getByRole("radio", { name: "Field terms" })).toBeChecked();
    await dialog.getByRole("radio", { name: "Words and phrases" }).click({ force: true });
    await dialog.getByRole("button", { name: "Save changes" }).click();

    await expect
      .poll(
        async () =>
          (
            await sql<{ kind: string }>("select kind from public.collections where id = $1", [
              collectionId,
            ])
          )[0]?.kind,
      )
      .toBe("vocabulary");
  });

  test("deleting a collection removes its terms", { tag: "@smoke" }, async ({ page, user }) => {
    const { collectionId, name } = await seedCollection(user);
    await gotoReady(page, `/app/library?collection=${collectionId}`);

    await page.getByRole("button", { name: "More", exact: true }).click();
    await page.getByRole("button", { name: "Delete collection" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();

    await expect(page.getByRole("link", { name })).toHaveCount(0);
    await expect
      .poll(
        async () =>
          (await sql("select 1 from public.collections where id = $1", [collectionId])).length,
      )
      .toBe(0);
  });

  test("opening a term shows every part of it", { tag: "@smoke" }, async ({ page, user }) => {
    const { collectionId } = await seedCollection(user);
    await gotoReady(page, `/app/library?collection=${collectionId}`);

    await page
      .getByRole("article")
      .filter({ hasText: FIRST_TERM })
      .getByRole("button")
      .first()
      .click();
    const detail = page
      .getByRole("dialog", { name: FIRST_TERM })
      .or(page.getByRole("complementary", { name: "Term" }));
    await expect(detail.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(
      detail.getByText("Slowing producers down when consumers fall behind."),
    ).toBeVisible();
  });

  test("the filters sheet hides known terms and remembers it", async ({ page, user, isMobile }) => {
    test.skip(isMobile, "Phones mark known by swiping a row");
    const { collectionId } = await seedCollection(user);
    await gotoReady(page, `/app/library?collection=${collectionId}`);
    const row = page.getByRole("article").filter({ hasText: FIRST_TERM });
    await row.getByRole("button", { name: "Mark known" }).click();
    await expect.poll(() => markedKnown(user.id, FIRST_TERM)).toBe(true);

    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("switch", { name: "Hide terms I know" }).check({ force: true });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("article").filter({ hasText: FIRST_TERM })).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole("article").filter({ hasText: FIRST_TERM })).toHaveCount(0);
  });

  test("pausing a collection offers Resume", async ({ page, user }) => {
    const { collectionId } = await seedCollection(user);
    await gotoReady(page, `/app/library?collection=${collectionId}`);

    await page.getByRole("button", { name: "More", exact: true }).click();
    await page.getByRole("button", { name: "Pause review" }).click();
    await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
    await page.getByRole("button", { name: "Resume" }).click();
    await expect(page.getByRole("navigation", { name: /^Study / })).toBeVisible();
  });
});

import { test } from "../fixtures";
import { sql } from "../support/db";
import { gotoReady } from "../support/navigation";
import { seedCollection, type SeedTerm } from "../support/seed";

const OUT =
  "/private/tmp/claude-502/-Users-behnam-projects-lobyas/338f3e7a-2b51-456f-946a-d90632f946af/scratchpad/shots";
const FULL = {
  term: "Conflict-free replicated data type (CRDT)",
  definition:
    "A data structure that many machines can change at the same time, without talking to each other first, and that always ends up in the same state once every machine has seen every change, no matter in what order the changes arrived.",
  category: "Consistency and replication across regions",
  mental_model:
    "A shared shopping list where adding and crossing off items always merge the same way.",
  example:
    "Collaborative whiteboards use CRDTs so two people dragging the same shape offline still converge.",
  anti_example: "A database that takes a lock and lets only one writer change a row at a time.",
  discussion:
    "You pick a CRDT when availability during partitions matters more than strict ordering.",
  controversy: "Some engineers argue a central sequencer is simpler for most products.",
  note: "Two families exist: state-based and operation-based.",
};
const terms = [
  {
    term: "Parking lot",
    definition: "A list of topics set aside for later.",
    category: "Meetings",
  },
  FULL,
  { term: "ありがとうございます", definition: "thank you (polite)", category: "あいさつ" },
] as unknown as SeedTerm[];

const SIZES = [
  { name: "m", width: 390, height: 844 },
  { name: "d", width: 1280, height: 800 },
];

test("visual", async ({ page, user }) => {
  test.setTimeout(480_000);
  const { collectionId } = await seedCollection(user, terms);
  const ids = await sql<{ id: string; term: string }>(
    "select id, term from public.terms where collection_id = $1",
    [collectionId],
  );
  const idOf = (t: string) => ids.find((r) => r.term === t)!.id;
  for (const size of SIZES) {
    await page.setViewportSize({ width: size.width, height: size.height });
    for (const theme of ["emerald", "dim"]) {
      const shot = async (name: string) => {
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${OUT}/${name}-${size.name}-${theme}.png` });
      };
      const setTheme = () =>
        page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await gotoReady(page, `/app/read?collection=${collectionId}`);
      await setTheme();
      await shot("cards-hidden");
      await page.getByRole("button", { name: "Show definition" }).first().click();
      await shot("cards-revealed");
      for (const [key, term] of [
        ["full", FULL.term],
        ["ja", "ありがとうございます"],
      ] as const) {
        await gotoReady(
          page,
          `/app/read?collection=${collectionId}&termId=${idOf(term)}&alreadyRead=true`,
        );
        await setTheme();
        await shot(`cards-${key}`);
      }
      await page.getByRole("button", { name: "Read options" }).click();
      await shot("options");
      await page.keyboard.press("Escape");
      await gotoReady(page, `/app/read/stories?collection=${collectionId}`);
      await setTheme();
      await shot("stories-setup");
      const write = page.getByRole("button", { name: "Write a story" });
      if (await write.isVisible().catch(() => false)) await write.click();
      await page.getByRole("button", { name: /Terms in this piece/ }).waitFor();
      await shot("story");
    }
  }
});

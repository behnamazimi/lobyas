import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures";
import { sql } from "../support/db";
import { gotoReady } from "../support/navigation";
import { seedCollection, type SeedTerm } from "../support/seed";
import type { TestUser } from "../support/users";

const DUTCH: SeedTerm[] = [
  { term: "het huis", definition: "the house" },
  { term: "de fiets", definition: "the bicycle" },
  { term: "lopen", definition: "to walk" },
  { term: "het boek", definition: "the book" },
  { term: "de straat", definition: "the street" },
  { term: "slapen", definition: "to sleep" },
  { term: "het water", definition: "the water" },
  { term: "de stoel", definition: "the chair" },
  { term: "lezen", definition: "to read" },
  { term: "de tafel", definition: "the table" },
];
const QUESTIONS = DUTCH.length;

async function hasNarration(userId: string) {
  await sql(
    `insert into public.ai_feature_allowlist (feature, user_id)
     values ('narration_term', $1) on conflict do nothing`,
    [userId],
  );
  const [row] = await sql<{ allowed: boolean }>(
    "select public.has_feature_access($1, 'narration_term') as allowed",
    [userId],
  );
  return row!.allowed;
}

async function quizTestCount(userId: string) {
  const [row] = await sql<{ total: string }>(
    "select coalesce(sum(quiz_test_count), 0) as total from public.review_state where user_id = $1",
    [userId],
  );
  return Number(row!.total);
}

/** A Dutch word list where every word has a clip and has been quizzed once,
 *  so each one can get a dictation question. */
async function seedListening(page: Page, user: TestUser) {
  const { collectionId } = await seedCollection(user, DUTCH, undefined, {
    language: "nl",
    kind: "vocabulary",
  });
  const terms = await sql<{ id: string }>("select id from public.terms where collection_id = $1", [
    collectionId,
  ]);
  for (const term of terms) {
    await sql(
      `insert into public.review_state
         (user_id, term_id, quiz_test_count, quiz_knowledge_posterior, last_quiz_tested_at)
       values ($1, $2, 1, 0.3, now() - interval '60 days')`,
      [user.id, term.id],
    );
  }

  await gotoReady(page, `/app/quiz?collection=${collectionId}`);
  // One at a time: the route makes one clip per person at a time.
  const statuses = await page.evaluate(
    async (ids) => {
      const result: number[] = [];
      for (const id of ids) {
        result.push((await fetch(`/api/narration/${id}`, { method: "POST" })).status);
      }
      return result;
    },
    terms.map((term) => term.id),
  );
  expect(
    statuses.every((status) => status === 200),
    statuses.join(","),
  ).toBe(true);
  return collectionId;
}

/** Answers other questions until a dictation one is on screen. */
async function reachDictation(page: Page) {
  const prompt = page.getByRole("heading", { name: "Type what you hear." });
  for (let question = 1; question <= QUESTIONS; question++) {
    await expect(page.getByText(new RegExp(`(Question|Retry) ${question} of \\d+`))).toBeVisible();
    if (await prompt.isVisible()) return question;

    const choices = page.getByRole("radiogroup", { name: "Answer choices" });
    if (await choices.isVisible()) await choices.locator("label").first().click();
    else await page.getByLabel("Your answer").fill("x");
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  throw new Error("No dictation question in this quiz");
}

/** Skips the dictation question on screen: the note names the answer, then Next moves on. */
async function skipAndContinue(page: Page) {
  await page.getByRole("button", { name: "Can't listen now" }).click();
  await expect(page.getByRole("status")).toContainText("Skipped, no problem");
  await page.getByRole("button", { name: /^(Next|See results)$/ }).click();
}

async function startQuiz(page: Page, collectionId: string) {
  await gotoReady(page, `/app/quiz?collection=${collectionId}`);
  await page.getByRole("radio", { name: String(QUESTIONS), exact: true }).click({ force: true });
  await page.getByRole("button", { name: "Start quiz" }).click();
}

test.describe("Dictation", () => {
  // Making ten clips one at a time takes a while.
  test.slow();

  test("plays the word and grades what was typed", async ({ page, user }) => {
    test.skip(!(await hasNarration(user.id)), "narration is switched off in this database");
    const collectionId = await seedListening(page, user);
    await startQuiz(page, collectionId);
    await reachDictation(page);

    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
    await page.getByLabel("Your answer").fill("verkeerd");
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(
      /Not quite\s*The answer is .+\.\s*It means: .+/,
    );
    await expect(page.getByRole("button", { name: "Can't listen now" })).toHaveCount(0);
  });

  test("can't listen now skips the question without scoring it", async ({ page, user }) => {
    test.skip(!(await hasNarration(user.id)), "narration is switched off in this database");
    const collectionId = await seedListening(page, user);
    const before = await quizTestCount(user.id);
    await startQuiz(page, collectionId);
    await reachDictation(page);

    await skipAndContinue(page);
    const results = page.getByRole("heading", { name: /\d+ of \d+ right/ });
    const choices = page.getByRole("radiogroup", { name: "Answer choices" });
    const typed = page.getByLabel("Your answer");
    for (let answered = 0; answered < QUESTIONS * 2; answered++) {
      await results.or(choices).or(typed).waitFor();
      if (await results.isVisible()) break;
      const skip = page.getByRole("button", { name: "Can't listen now" });
      if (await skip.isVisible()) {
        await skipAndContinue(page);
        continue;
      }
      if (await choices.isVisible()) await choices.locator("label").first().click();
      else await typed.fill("x");
      await page.getByRole("button", { name: "Check", exact: true }).click();
      await page.getByRole("button", { name: /^(Next|See results)$/ }).click();
    }

    await expect(page.getByRole("heading", { name: /\d+ of \d+ right/ })).toBeVisible();
    await expect.poll(() => quizTestCount(user.id)).toBeLessThanOrEqual(before + QUESTIONS - 1);
  });
});

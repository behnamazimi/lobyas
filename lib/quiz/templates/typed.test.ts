import { describe, expect, it } from "vitest";
import { MASK } from "../text/mask";
import { makeDistractor, makeTerm, rngOf, sourceOf } from "../test-support";
import { quizFeedbackLine, templatesFor } from "./registry";
import { typedCloze } from "./typed-cloze";
import { typedMeaningToWord } from "./typed-meaning-to-word";
import type { BuildContext } from "./types";

const fietsen = makeTerm({
  id: "t1",
  kind: "vocabulary",
  language: "nl",
  term: "fietsen",
  definition: "to cycle",
  example: "We fietsen naar het strand.",
});
const ctx = (sameGloss = [] as ReturnType<typeof makeDistractor>[]): BuildContext => ({
  source: sourceOf([], sameGloss),
  rng: rngOf(0.1),
});

describe("typed eligibility", () => {
  it("does not depend on how well the learner knows the term", () => {
    expect(typedCloze.eligible(fietsen)).toBe(true);
    expect(typedCloze.eligible({ ...fietsen, recognition: undefined })).toBe(true);
    expect(
      typedCloze.eligible({
        ...fietsen,
        recognition: { posterior: 0.1, testCount: 0 },
      }),
    ).toBe(true);
  });

  it("keeps terms longer than three words as multiple choice", () => {
    const long = {
      ...fietsen,
      term: "het is de moeite waard",
      example: "Het is de moeite waard.",
    };
    expect(typedCloze.eligible(long)).toBe(false);
    expect(typedMeaningToWord.eligible(long)).toBe(false);
    expect(typedMeaningToWord.eligible({ ...long, term: "de moeite waard" })).toBe(true);
  });

  it("is for vocabulary only", () => {
    const webTerms = templatesFor("terms").map((t) => t.id);
    expect(webTerms).not.toContain("typed_cloze");
    expect(webTerms).not.toContain("typed_meaning_to_word");
    expect(templatesFor("vocabulary").map((t) => t.id)).toEqual(
      expect.arrayContaining(["typed_cloze", "typed_meaning_to_word"]),
    );
  });
});

describe("typed_cloze", () => {
  it("needs an exact-match example", () => {
    expect(typedCloze.eligible({ ...fietsen, example: "Ik fiets naar het strand." })).toBe(false);
    expect(typedCloze.eligible({ ...fietsen, example: null })).toBe(false);
  });

  it("blanks the example and hints at the meaning without the word", async () => {
    const q = await typedCloze.build(fietsen, ctx());
    expect(q).toMatchObject({
      interaction: "text",
      template: "typed_cloze",
      quote: `We ${MASK} naar het strand.`,
      hint: "Meaning: to cycle",
      acceptedAnswers: ["fietsen"],
      language: "nl",
    });
  });
});

describe("typed_meaning_to_word", () => {
  it("shows the gloss and accepts the word", async () => {
    const q = await typedMeaningToWord.build(fietsen, ctx());
    expect(q).toMatchObject({
      interaction: "text",
      template: "typed_meaning_to_word",
      quote: "to cycle",
      acceptedAnswers: ["fietsen"],
    });
  });

  it("gives up when another term shares the meaning", async () => {
    const other = makeDistractor({
      id: "t2",
      term: "rijden",
      definition: "to cycle",
    });
    expect(await typedMeaningToWord.build(fietsen, ctx([other]))).toBeNull();
  });
});

describe("typed feedback", () => {
  it("is silent on a pass and shows the answer on a miss", async () => {
    const q = (await typedCloze.build(fietsen, ctx()))!;
    const typed = (text: string) => ({ interaction: "text" as const, text });
    expect(quizFeedbackLine(q, true, typed("fietsen"))).toBeNull();
    expect(quizFeedbackLine(q, false, typed("lopen"))).toBe("The answer is fietsen.");
    expect(quizFeedbackLine(q, false, null)).toBe("The answer is fietsen.");
  });

  it("says when only the accents or the article were wrong", async () => {
    const cafe = makeTerm({
      kind: "vocabulary",
      term: "het café",
      definition: "the cafe",
    });
    const q = (await typedMeaningToWord.build(cafe, ctx()))!;
    const typed = (text: string) => ({ interaction: "text" as const, text });
    expect(quizFeedbackLine(q, false, typed("het cafe"))).toBe(
      "The answer is het café. Check the accents.",
    );
    expect(quizFeedbackLine(q, false, typed("café"))).toBe(
      "The answer is het café. Check the article.",
    );
  });
});

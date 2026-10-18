import { describe, expect, it } from "vitest";
import type { QuizQuestion } from "./types";
import { missedQuestions, missedTermIds, scoredTotal, scoreOf } from "./results";

function question(termId: string): QuizQuestion {
  return {
    interaction: "boolean",
    template: "does_it_fit",
    termId,
    prompt: `Is ${termId} right?`,
    correctAnswer: true,
  };
}

describe("missedQuestions", () => {
  const questions = [question("a"), question("b"), question("c")];

  it("keeps only the questions answered wrong", () => {
    const answers = [
      { termId: "a", passed: true },
      { termId: "b", passed: false },
      { termId: "c", passed: false },
    ];
    expect(missedQuestions(questions, answers).map((q) => q.termId)).toEqual(["b", "c"]);
  });

  it("doesn't count unanswered questions as missed", () => {
    expect(missedQuestions(questions, [{ termId: "a", passed: false }])).toHaveLength(1);
  });

  it("doesn't count skipped questions as missed or toward the total", () => {
    const answers = [
      { termId: "a", passed: false, skipped: true },
      { termId: "b", passed: false },
    ];
    expect(missedQuestions(questions, answers).map((q) => q.termId)).toEqual(["b"]);
    expect(scoredTotal(questions, answers)).toBe(2);
  });
});

describe("missedTermIds", () => {
  it("lists a term missed twice once, in first-missed order", () => {
    const questions = [question("b"), question("a"), question("b")];
    const answers = [
      { termId: "b", passed: false },
      { termId: "a", passed: false },
      { termId: "b", passed: false },
    ];
    expect(missedTermIds(questions, answers)).toEqual(["b", "a"]);
  });
});

describe("retries", () => {
  const questions = [question("a"), question("b"), { ...question("b"), retry: 1 as const }];
  const answers = [
    { termId: "a", passed: true },
    { termId: "b", passed: false },
    { termId: "b", passed: true, retry: 1 as const },
  ];

  it("don't change the score, the total or what counts as missed", () => {
    expect(scoreOf(answers)).toBe(1);
    expect(scoredTotal(questions, answers)).toBe(2);
    expect(missedQuestions(questions, answers).map((q) => q.termId)).toEqual(["b"]);
  });
});

import { describe, expect, it } from "vitest";
import { questionsAfterAnswer } from "./retry";
import type { QuizQuestion } from "./types";

function question(termId: string, retry?: 1 | 2): QuizQuestion {
  return {
    interaction: "choice",
    template: "definition_to_term",
    termId,
    prompt: termId,
    options: [
      { id: "1", text: "one" },
      { id: "2", text: "two" },
      { id: "3", text: "three" },
    ],
    correctOptionIds: ["1"],
    ...(retry ? { retry } : {}),
  };
}

const quiz = (size: number) => Array.from({ length: size }, (_, i) => question(`t${i}`));
const labels = (questions: QuizQuestion[]) =>
  questions.map((q) => (q.retry ? `${q.termId}'${q.retry}` : q.termId));

function answer(questions: QuizQuestion[], currentIndex: number, passed: boolean) {
  return questionsAfterAnswer({ questions, currentIndex, passed, scored: true });
}

describe("questionsAfterAnswer", () => {
  it("adds nothing for a right first attempt", () => {
    const questions = quiz(5);
    expect(answer(questions, 0, true)).toBe(questions);
  });

  it("queues retry 1 two questions later in a quiz of five", () => {
    expect(labels(answer(quiz(5), 0, false))).toEqual(["t0", "t1", "t2", "t0'1", "t3", "t4"]);
  });

  it("waits three questions in a quiz of ten, four from fifteen up", () => {
    expect(labels(answer(quiz(10), 0, false)).indexOf("t0'1")).toBe(4);
    expect(labels(answer(quiz(30), 0, false)).indexOf("t0'1")).toBe(5);
  });

  it("puts a late miss at the end rather than past it", () => {
    expect(labels(answer(quiz(5), 3, false))).toEqual(["t0", "t1", "t2", "t3", "t4", "t3'1"]);
    expect(labels(answer(quiz(5), 4, false))).toEqual(["t0", "t1", "t2", "t3", "t4", "t4'1"]);
  });

  it("asks for retry 2 only after a right retry 1, twice as far away", () => {
    const questions = [question("a"), question("x"), question("y"), question("a", 1), ...quiz(8)];
    const next = labels(answer(questions, 3, true));
    expect(next.indexOf("a'2")).toBe(3 + 1 + 2 * 3);
    expect(answer(questions, 3, false)).toBe(questions);
  });

  it("stops after retry 2, right or wrong", () => {
    const questions = [question("a", 2), question("b")];
    expect(answer(questions, 0, true)).toBe(questions);
    expect(answer(questions, 0, false)).toBe(questions);
  });

  it("keeps retries apart while other questions remain", () => {
    const first = answer(quiz(10), 0, false);
    const second = answer(first, 1, false);
    const order = labels(second);
    expect(order[order.indexOf("t0'1") + 1]).not.toMatch(/'/);
    expect(order[order.indexOf("t1'1") - 1]).not.toMatch(/'/);
  });

  it("never queues anything in practice or for a skipped question", () => {
    const questions = quiz(5);
    expect(questionsAfterAnswer({ questions, currentIndex: 0, passed: false, scored: false })).toBe(
      questions,
    );
  });

  it("re-shuffles the options of a retry without changing them", () => {
    const rng = () => 0;
    const [, retry] = questionsAfterAnswer({
      questions: [question("a")],
      currentIndex: 0,
      passed: false,
      scored: true,
      rng,
    });
    if (retry.interaction !== "choice") throw new Error("expected a choice question");
    expect(retry.options.map((o) => o.id).sort()).toEqual(["1", "2", "3"]);
    expect(retry.options.map((o) => o.id)).not.toEqual(["1", "2", "3"]);
  });

  it.each([5, 10, 30])("always ends: all-wrong answers add at most %i retries", (size) => {
    let questions = quiz(size);
    for (let index = 0; index < questions.length; index++) {
      questions = answer(questions, index, false);
    }
    expect(questions.length).toBeLessThanOrEqual(size * 2);
    expect(questions.filter((q) => q.retry)).toHaveLength(size);
  });
});

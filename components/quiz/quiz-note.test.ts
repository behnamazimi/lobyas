import { describe, expect, it } from "vitest";
import { quizNote } from "./quiz-note";
import type { QuizQuestion } from "@/lib/quiz/types";

const choice: QuizQuestion = {
  interaction: "choice",
  template: "definition_to_term",
  termId: "t",
  prompt: "Which term?",
  options: [
    { id: "a", text: "Deadline" },
    { id: "b", text: "Blocker" },
  ],
  correctOptionIds: ["b"],
};

const dictation: QuizQuestion = {
  interaction: "text",
  template: "dictation",
  termId: "t",
  prompt: "Type what you hear.",
  acceptedAnswers: ["goedemorgen"],
  language: "nl",
  dictation: { clipVersion: "v1", meaning: "good morning" },
};

describe("quizNote", () => {
  it("uses the template's line when it already names the answer", () => {
    expect(quizNote(choice, { passed: false, skipped: false, response: null })).toEqual({
      kind: "wrong",
      title: "Not quite",
      detail: "That definition is for Blocker.",
      answer: "Blocker",
    });
  });

  it("adds the answer when the template says nothing about it", () => {
    const fit: QuizQuestion = {
      interaction: "boolean",
      template: "does_it_fit",
      termId: "t",
      prompt: "Is this an example?",
      correctAnswer: true,
    };
    expect(quizNote(fit, { passed: false, skipped: false, response: null }).detail).toMatch(
      /^The answer is “\w+”\./,
    );
  });

  it("has no detail for a right choice", () => {
    expect(quizNote(choice, { passed: true, skipped: false, response: null }).detail).toBe("");
  });

  it("shows the answer and meaning when dictation is skipped", () => {
    expect(quizNote(dictation, { passed: false, skipped: true, response: null })).toEqual({
      kind: "skipped",
      title: "Skipped, no problem",
      detail: "The answer is goedemorgen. It means: good morning",
      answer: "goedemorgen",
    });
  });

  it("keeps the meaning on a right dictation answer", () => {
    expect(quizNote(dictation, { passed: true, skipped: false, response: null }).detail).toBe(
      "“goedemorgen” means: good morning",
    );
  });
});

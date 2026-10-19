import type { QuizResponse } from "@/lib/quiz/types";

/** How one answer option shows once the answer is submitted. */
export type QuizChoiceResult = "default" | "correct" | "wrong";

export function answerResult(
  isCorrect: boolean,
  isSelected: boolean,
  submitted: boolean,
): QuizChoiceResult {
  if (!submitted) return "default";
  if (isCorrect) return "correct";
  if (isSelected) return "wrong";
  return "default";
}

// The check→next flow moves through exactly three phases: picking an answer,
// locked while feedback shows, then ready to advance. Modeling it as a
// reducer makes combinations like "locked but advance is enabled" impossible.
type QuizAnswerPhase = "answering" | "locked" | "ready";

export type QuizAnswerState = {
  phase: QuizAnswerPhase;
  response: QuizResponse | null;
  passed: boolean;
  /** The learner couldn't listen: nothing was graded. */
  skipped: boolean;
};

export type QuizAnswerAction =
  | { type: "RESPOND"; response: QuizResponse }
  | { type: "SUBMIT"; passed: boolean }
  | { type: "SKIP" }
  | { type: "UNLOCK" };

export const initialAnswerState: QuizAnswerState = {
  phase: "answering",
  response: null,
  passed: false,
  skipped: false,
};

export function quizAnswerReducer(
  state: QuizAnswerState,
  action: QuizAnswerAction,
): QuizAnswerState {
  switch (action.type) {
    case "RESPOND":
      if (state.phase !== "answering") return state;
      return { ...state, response: action.response };
    case "SUBMIT":
      if (state.phase !== "answering") return state;
      return { ...state, phase: "locked", passed: action.passed };
    case "SKIP":
      if (state.phase !== "answering") return state;
      return { ...state, phase: "locked", passed: false, skipped: true };
    case "UNLOCK":
      if (state.phase !== "locked") return state;
      return { ...state, phase: "ready" };
  }
}

export function canSubmitAnswer(state: QuizAnswerState): boolean {
  const { response } = state;
  if (response === null) return false;
  return response.interaction !== "text" || response.text.trim().length > 0;
}

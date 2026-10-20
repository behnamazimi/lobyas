"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { feedback } from "@/lib/feedback";
import { QuestionCard } from "@/components/kit";
import { QuizAnswerChoices } from "@/components/quiz/quiz-answer-choices";
import { DictationPlayer } from "@/components/quiz/dictation-player";
import { questionLabel, quizNote } from "@/components/quiz/quiz-note";
import { QuizQuestionFooter } from "@/components/quiz/quiz-question-footer";
import type { QuizQuestion } from "@/lib/quiz/types";
import { gradeAnswer } from "@/lib/quiz/grade";
import { quizResponseForKey } from "@/lib/quiz/keyboard";
import {
  canSubmitAnswer,
  initialAnswerState,
  quizAnswerReducer,
} from "@/components/quiz/quiz-question-state";

/** Radios are inputs too, so only fields you type into count. */
function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.tagName === "TEXTAREA") return true;
  return (
    target instanceof HTMLInputElement && target.type !== "radio" && target.type !== "checkbox"
  );
}

type QuizQuestionViewProps = {
  question: QuizQuestion;
  /** Whether this answer, right or wrong, ends the quiz. */
  isLast: (passed: boolean, skipped?: boolean) => boolean;
  onAnswer: (passed: boolean) => void;
  /** Moves on without scoring, when a dictation clip can't be heard. */
  onSkip: () => void;
};

export function QuizQuestionView({ question, isLast, onAnswer, onSkip }: QuizQuestionViewProps) {
  const [state, dispatch] = useReducer(quizAnswerReducer, initialAnswerState);
  // Brief pop when the advance button unlocks, so the lockout reads as
  // "getting ready" instead of an unresponsive click. Pure animation timing,
  // not part of the answer lifecycle, so it stays outside the reducer.
  const [justUnlocked, setJustUnlocked] = useState(false);

  const canSubmit = canSubmitAnswer(state);

  const stateRef = useRef({ state, canSubmit, question, onAnswer, onSkip });
  stateRef.current = { state, canSubmit, question, onAnswer, onSkip };

  const lockoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockPopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (lockoutTimeoutRef.current) clearTimeout(lockoutTimeoutRef.current);
      if (unlockPopTimeoutRef.current) clearTimeout(unlockPopTimeoutRef.current);
    };
  }, []);

  // A real double-click delivers two click events in quick succession. Without this
  // delay, the first click submits and the second immediately lands on the button's
  // new "Next question" position, skipping the feedback entirely.
  const ADVANCE_LOCKOUT_MS = 350;

  function submitAnswer() {
    const current = stateRef.current;
    if (current.state.phase !== "answering" || !current.canSubmit) return;

    if (!current.state.response) return;

    const passed = gradeAnswer(current.question, current.state.response);
    dispatch({ type: "SUBMIT", passed });
    feedback(passed ? "answer-correct" : "answer-wrong");
    // Closes the keyboard now that the answer is in.
    if (isTextEntryTarget(document.activeElement)) (document.activeElement as HTMLElement).blur();
    startLockout();
  }

  function startLockout() {
    lockoutTimeoutRef.current = setTimeout(() => {
      dispatch({ type: "UNLOCK" });
      setJustUnlocked(true);
      unlockPopTimeoutRef.current = setTimeout(() => setJustUnlocked(false), 260);
    }, ADVANCE_LOCKOUT_MS);
  }

  function skipQuestion() {
    if (stateRef.current.state.phase !== "answering") return;
    dispatch({ type: "SKIP" });
    if (isTextEntryTarget(document.activeElement)) (document.activeElement as HTMLElement).blur();
    startLockout();
  }

  function advanceAnswer() {
    const current = stateRef.current;
    if (current.state.phase !== "ready") return;
    if (current.state.skipped) current.onSkip();
    else current.onAnswer(current.state.passed);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const response = quizResponseForKey(
        {
          key: event.key,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
          repeat: event.repeat,
          typing: isTextEntryTarget(event.target),
        },
        stateRef.current.question,
      );
      if (response) {
        if (stateRef.current.state.phase !== "answering") return;
        event.preventDefault();
        dispatch({ type: "RESPOND", response });
        return;
      }

      if (event.key !== "Enter" || event.isComposing) return;

      const target = event.target as HTMLElement;
      if (target.tagName === "TEXTAREA") return;

      const current = stateRef.current;

      if (current.state.phase === "answering") {
        if (!current.canSubmit) return;

        event.preventDefault();
        event.stopPropagation();
        submitAnswer();
        return;
      }

      if (current.state.phase !== "ready") return;

      event.preventDefault();
      event.stopPropagation();
      advanceAnswer();
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  const submitted = state.phase !== "answering";
  const canAdvance = state.phase === "ready";
  const note = submitted
    ? quizNote(question, {
        passed: state.passed,
        skipped: state.skipped,
        response: state.response,
      })
    : null;
  const isDictation = question.interaction === "text" && question.dictation;
  const quoteIsWord =
    question.template === "typed_meaning_to_word" && (question.quote?.length ?? 0) <= 40;

  return (
    <div className="quiz-feedback-enter flex min-h-0 flex-1 flex-col gap-2">
      <div className="-mx-5 min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-3">
        <QuestionCard
          label={questionLabel(question)}
          prompt={question.prompt}
          quote={question.quote}
          quoteStyle={quoteIsWord ? "word" : "box"}
        >
          {question.interaction === "text" && question.dictation ? (
            <DictationPlayer
              termId={question.termId}
              clipVersion={question.dictation.clipVersion}
              answered={submitted}
              onCantListen={skipQuestion}
            />
          ) : null}
          {question.interaction === "text" && question.hint ? (
            <p className="m-0 mt-2.5 text-sm font-semibold text-muted">{question.hint}</p>
          ) : null}
        </QuestionCard>

        <QuizAnswerChoices
          question={question}
          response={state.response}
          submitted={submitted}
          skipped={state.skipped}
          onRespond={(response) => dispatch({ type: "RESPOND", response })}
        />
      </div>

      <QuizQuestionFooter
        note={note}
        skipSlot={
          isDictation ? (
            <button
              type="button"
              onClick={skipQuestion}
              className="mx-auto min-h-11 px-3.5 text-[15px] font-extrabold text-read-text"
            >
              Can&apos;t listen now
            </button>
          ) : null
        }
        submitted={submitted}
        isLast={isLast(state.passed, state.skipped)}
        canSubmit={canSubmit}
        canAdvance={canAdvance}
        justUnlocked={justUnlocked}
        onSubmit={submitAnswer}
        onAdvance={advanceAnswer}
      />
    </div>
  );
}

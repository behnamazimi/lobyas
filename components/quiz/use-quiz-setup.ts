import { useMemo, useState } from "react";
import { type StudyCollection } from "@/lib/study/types";
import { maxQuizQuestions, quizCountPresets } from "@/lib/quiz/question-limit";
import { countTermsForSelection } from "@/lib/quiz/terms";
import {
  questionCountFor,
  quizSetupToSave,
  saveQuizSetupPreference,
  type InitialQuizSetup,
} from "@/lib/quiz/setup-preference";
import type { QuizQuestionStyle } from "@/lib/quiz/types";

export type QuizStep = "picker" | "generating" | "playing" | "results" | "error";

export function useQuizSetup(collections: StudyCollection[], initial: InitialQuizSetup) {
  const collectionId = initial.collectionId;
  const collectionIds = useMemo(() => [collectionId], [collectionId]);
  const availableTermCount = useMemo(
    () => countTermsForSelection(collections, collectionIds),
    [collections, collectionIds],
  );
  const maxFor = (style: QuizQuestionStyle) => maxQuizQuestions(style, availableTermCount);

  const [step, setStep] = useState<QuizStep>("picker");
  const [questionStyle, setQuestionStyleState] = useState<QuizQuestionStyle>(initial.style);
  // The count the user asked for; the field shows it capped to the
  // collection's size, so switching collections never loses it.
  const [preferredCount, setPreferredCount] = useState<number | null>(initial.count);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(() =>
    questionCountFor(initial.count, maxFor(initial.style)),
  );
  const [questionCountInput, setQuestionCountInput] = useState(() => String(questionCount));
  const [questionCountError, setQuestionCountError] = useState<string | null>(null);

  const maxQuestionCount = maxQuizQuestions(questionStyle, availableTermCount);

  function showQuestionCount(value: number) {
    setQuestionCount(value);
    setQuestionCountInput(String(value));
    setQuestionCountError(null);
  }

  function setQuestionStyle(style: QuizQuestionStyle) {
    setQuestionStyleState(style);
    showQuestionCount(questionCountFor(preferredCount, maxFor(style)));
  }

  function applyQuestionCount(value: number) {
    setPreferredCount(value);
    showQuestionCount(value);
  }

  function handleQuestionCountInputChange(value: string) {
    setQuestionCountInput(value);

    if (value === "") {
      setQuestionCountError(null);
      return;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > maxQuestionCount) {
      setQuestionCountError(`Please enter a number between 1 and ${maxQuestionCount}`);
    } else {
      setQuestionCount(parsed);
      setPreferredCount(parsed);
      setQuestionCountError(null);
    }
  }

  function saveSetup() {
    saveQuizSetupPreference(quizSetupToSave({ style: questionStyle, preferredCount }));
  }

  const questionCountPresets = quizCountPresets(maxQuestionCount);

  return {
    step,
    setStep,
    questionStyle,
    setQuestionStyle,
    collectionId,
    errorMessage,
    setErrorMessage,
    questionCount,
    setQuestionCount,
    questionCountInput,
    setQuestionCountInput,
    questionCountError,
    collectionIds,
    availableTermCount,
    questionCountPresets,
    applyQuestionCount,
    handleQuestionCountInputChange,
    saveSetup,
  };
}

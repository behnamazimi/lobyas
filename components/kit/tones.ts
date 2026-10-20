export type Tone = "neutral" | "read" | "review" | "quiz" | "success" | "hard" | "wrong";

type ToneClasses = {
  /** Tint behind text, with the matching text step. */
  soft: string;
  /** The tint's text step alone, for icons and labels on a card. */
  text: string;
  /** The ring arc or bar fill. */
  ring: string;
};

/** Class names are written out in full so Tailwind sees them. */
export const TONES: Record<Tone, ToneClasses> = {
  neutral: {
    soft: "bg-base-200 text-base-content",
    text: "text-base-content",
    ring: "stroke-base-content",
  },
  read: {
    soft: "bg-read-tint text-read-text",
    text: "text-read-text",
    ring: "stroke-read-ring",
  },
  review: {
    soft: "bg-review-tint text-review-text",
    text: "text-review-text",
    ring: "stroke-review-ring",
  },
  quiz: {
    soft: "bg-quiz-tint text-quiz-text",
    text: "text-quiz-text",
    ring: "stroke-quiz-ring",
  },
  success: {
    soft: "bg-success-tint text-success-text",
    text: "text-success-text",
    ring: "stroke-mastered",
  },
  hard: {
    soft: "bg-hard-tint text-hard-text",
    text: "text-hard-text",
    ring: "stroke-hard-text",
  },
  wrong: {
    soft: "bg-wrong-tint text-wrong-text",
    text: "text-wrong-text",
    ring: "stroke-wrong",
  },
};

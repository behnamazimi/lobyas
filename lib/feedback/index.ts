import { buzz, type HapticKind } from "@/lib/native/haptics";
import { playSound, type SoundName } from "@/lib/feedback/sounds";

type Effects = { sound?: SoundName; haptic?: HapticKind };

/** Sounds are for the quiz only; haptics (app only) also mark Review, Triage and goals. */
const CUES = {
  "answer-correct": { sound: "correct", haptic: "success" },
  "answer-wrong": { sound: "wrong", haptic: "warning" },
  "quiz-finish": { sound: "finish", haptic: "success" },
  "goal-met": { haptic: "success" },
  rate: { haptic: "tap" },
  choose: { haptic: "tap" },
} satisfies Record<string, Effects>;

export type Cue = keyof typeof CUES;

export function feedback(cue: Cue) {
  const effects: Effects = CUES[cue];
  if (effects.sound) playSound(effects.sound);
  if (effects.haptic) buzz(effects.haptic);
}

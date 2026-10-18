import { haptic } from "@/lib/native/haptics";
import { playQuizSound } from "@/lib/sound/quiz-sounds";

export function signalAnswer(passed: boolean) {
  playQuizSound(passed ? "correct" : "wrong");
  haptic(passed ? "success" : "warning");
}

export function signalFinish() {
  playQuizSound("finish");
  haptic("success");
}

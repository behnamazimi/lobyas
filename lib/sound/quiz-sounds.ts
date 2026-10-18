export type QuizSound = "correct" | "wrong" | "finish";

type Note = { freq: number; start: number; length: number };

const NOTES: Record<QuizSound, Note[]> = {
  correct: [
    { freq: 659, start: 0, length: 0.12 },
    { freq: 988, start: 0.09, length: 0.2 },
  ],
  wrong: [
    { freq: 262, start: 0, length: 0.14 },
    { freq: 208, start: 0.12, length: 0.24 },
  ],
  finish: [
    { freq: 523, start: 0, length: 0.14 },
    { freq: 659, start: 0.12, length: 0.14 },
    { freq: 784, start: 0.24, length: 0.14 },
    { freq: 1047, start: 0.36, length: 0.34 },
  ],
};

const VOLUME = 0.12;

let context: AudioContext | null = null;

/** Plays a short synthesized cue. Call it from a tap or key press so the browser allows audio. */
export function playQuizSound(sound: QuizSound) {
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    const now = context.currentTime;
    for (const { freq, start, length } of NOTES[sound]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = sound === "wrong" ? "triangle" : "sine";
      oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(VOLUME, now + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + start);
      oscillator.stop(now + start + length + 0.02);
    }
  } catch {
    // No audio support: the quiz works the same without it.
  }
}

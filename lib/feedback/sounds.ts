export type SoundName = "correct" | "wrong" | "finish";

type Note = { freq: number; start: number; length: number };

const NOTES: Record<SoundName, Note[]> = {
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
const ATTACK_SECONDS = 0.015;
const SILENCE = 0.0001;

let context: AudioContext | null = null;

function audioContext(): AudioContext {
  context ??= new AudioContext();
  // Browsers start it suspended until a tap, and iOS interrupts it after a call or a lock.
  if (context.state !== "running") void context.resume();
  return context;
}

/** Plays a short synthesized cue. Call it from a tap or key press so the browser allows audio. */
export function playSound(sound: SoundName) {
  try {
    const ctx = audioContext();
    const now = ctx.currentTime;
    for (const { freq, start, length } of NOTES[sound]) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = sound === "wrong" ? "triangle" : "sine";
      oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(SILENCE, now + start);
      gain.gain.exponentialRampToValueAtTime(VOLUME, now + start + ATTACK_SECONDS);
      gain.gain.exponentialRampToValueAtTime(SILENCE, now + start + length);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(now + start);
      oscillator.stop(now + start + length + 0.02);
    }
  } catch {
    // No audio support: the app works the same without it.
  }
}

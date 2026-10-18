export type SoundName = "correct" | "wrong" | "finish";

type Note = {
  freq: number;
  start: number;
  length: number;
  /** Extra overtones as [frequency ratio, loudness]; the base tone is always played. */
  overtones?: [number, number][];
};

const WARM: [number, number][] = [[2, 0.2]];

const NOTES: Record<SoundName, Note[]> = {
  correct: [
    { freq: 659, start: 0, length: 0.14, overtones: WARM },
    { freq: 988, start: 0.1, length: 0.24, overtones: WARM },
  ],
  wrong: [
    { freq: 440, start: 0, length: 0.14, overtones: WARM },
    { freq: 330, start: 0.11, length: 0.24, overtones: WARM },
  ],
  finish: [
    { freq: 659, start: 0, length: 0.14, overtones: WARM },
    { freq: 831, start: 0.08, length: 0.14, overtones: WARM },
    { freq: 988, start: 0.16, length: 0.14, overtones: WARM },
    { freq: 1319, start: 0.24, length: 0.36, overtones: WARM },
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
    for (const { freq, start, length, overtones = [] } of NOTES[sound]) {
      const at = now + start;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(SILENCE, at);
      gain.gain.exponentialRampToValueAtTime(VOLUME, at + ATTACK_SECONDS);
      gain.gain.exponentialRampToValueAtTime(SILENCE, at + length);
      gain.connect(ctx.destination);
      for (const [ratio, loudness] of [[1, 1], ...overtones]) {
        const oscillator = ctx.createOscillator();
        const level = ctx.createGain();
        level.gain.value = loudness;
        oscillator.frequency.setValueAtTime(freq * ratio, at);
        oscillator.connect(level).connect(gain);
        oscillator.start(at);
        oscillator.stop(at + length + 0.02);
      }
    }
  } catch {
    // No audio support: the app works the same without it.
  }
}

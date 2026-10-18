export type SoundName = "correct" | "wrong" | "finish";

type Note = {
  freq: number;
  start: number;
  length: number;
  /** Pitch the note slides to by its end. */
  glideTo?: number;
  /** Extra overtones as [frequency ratio, loudness]; the base tone is always played. */
  overtones?: [number, number][];
};

const BELL: [number, number][] = [[2.76, 0.3]];

const NOTES: Record<SoundName, Note[]> = {
  correct: [{ freq: 1319, start: 0, length: 0.4, overtones: BELL }],
  wrong: [{ freq: 220, start: 0, length: 0.22, glideTo: 110 }],
  finish: [
    { freq: 1047, start: 0, length: 0.3, overtones: BELL },
    { freq: 1319, start: 0.07, length: 0.3, overtones: BELL },
    { freq: 1568, start: 0.14, length: 0.3, overtones: BELL },
    { freq: 2093, start: 0.21, length: 0.6, overtones: BELL },
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
    for (const { freq, start, length, glideTo, overtones = [] } of NOTES[sound]) {
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
        if (glideTo)
          oscillator.frequency.exponentialRampToValueAtTime(glideTo * ratio, at + length);
        oscillator.connect(level).connect(gain);
        oscillator.start(at);
        oscillator.stop(at + length + 0.02);
      }
    }
  } catch {
    // No audio support: the app works the same without it.
  }
}

const WINDOW_SECONDS = 0.02;
// Sound is anything within this many dB of the loudest window.
const SOUND_RANGE_DB = 35;
// Gaps up to this many windows (120 ms) are inside one stretch of sound.
const MERGE_WINDOWS = 6;
const MIN_TAIL_SECONDS = 0.4;
const MIN_GAP_SECONDS = 0.15;
const KEEP_SECONDS = 0.15;
const FADE_SECONDS = 0.03;
// Below this the clip is silence and there is nothing to trim.
const SILENCE_DB = -60;

type Stretch = { start: number; end: number };

function windowLevels(pcm: Buffer, windowSamples: number): number[] {
  const levels: number[] = [];
  for (let from = 0; (from + windowSamples) * 2 <= pcm.length; from += windowSamples) {
    let sum = 0;
    for (let i = from; i < from + windowSamples; i++) sum += (pcm.readInt16LE(i * 2) / 32768) ** 2;
    levels.push(10 * Math.log10(sum / windowSamples + 1e-12));
  }
  return levels;
}

function soundStretches(levels: number[], floorDb: number): Stretch[] {
  const stretches: Stretch[] = [];
  levels.forEach((db, window) => {
    if (db <= floorDb) return;
    const last = stretches.at(-1);
    if (last && window - last.end <= MERGE_WINDOWS) last.end = window + 1;
    else stretches.push({ start: window, end: window + 1 });
  });
  return stretches;
}

/** Gemini ends many clips with a short burst of noise after the last word. Drops a final
 *  stretch of sound that is under 0.4 s and follows a pause, then fades the end out.
 *  shortcut: a real last word that short after a pause is cut too; revisit if that is heard. */
export function trimTrailingNoise(pcm: Buffer, sampleRate: number): Buffer {
  const windowSamples = Math.floor(sampleRate * WINDOW_SECONDS);
  const levels = windowLevels(pcm, windowSamples);
  if (levels.length === 0) return pcm;
  const peak = Math.max(...levels);
  if (peak < SILENCE_DB) return pcm;

  const stretches = soundStretches(levels, peak - SOUND_RANGE_DB);
  const tail = stretches.at(-1)!;
  const before = stretches.at(-2);
  const isNoise =
    before !== undefined &&
    (tail.end - tail.start) * WINDOW_SECONDS < MIN_TAIL_SECONDS &&
    (tail.start - before.end) * WINDOW_SECONDS >= MIN_GAP_SECONDS;
  const lastSound = isNoise ? before.end : tail.end;

  const keep = Math.min(
    pcm.length / 2,
    lastSound * windowSamples + Math.floor(sampleRate * KEEP_SECONDS),
  );
  const trimmed = Buffer.from(pcm.subarray(0, keep * 2));
  const fade = Math.min(keep, Math.floor(sampleRate * FADE_SECONDS));
  for (let i = 0; i < fade; i++) {
    const at = (keep - fade + i) * 2;
    trimmed.writeInt16LE(Math.round(trimmed.readInt16LE(at) * (1 - i / fade)), at);
  }
  return trimmed;
}

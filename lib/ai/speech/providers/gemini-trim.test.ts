import { describe, expect, it } from "vitest";
import { trimTrailingNoise } from "./gemini-trim";

const RATE = 24_000;

function tone(seconds: number, amplitude = 8_000): Buffer {
  const pcm = Buffer.alloc(Math.round(seconds * RATE) * 2);
  for (let i = 0; i < pcm.length / 2; i++) {
    pcm.writeInt16LE(Math.round(amplitude * Math.sin((2 * Math.PI * 200 * i) / RATE)), i * 2);
  }
  return pcm;
}

const quiet = (seconds: number) => Buffer.alloc(Math.round(seconds * RATE) * 2);
const seconds = (pcm: Buffer) => pcm.length / 2 / RATE;

describe("trimTrailingNoise", () => {
  it("drops a short burst that follows a pause", () => {
    const clip = Buffer.concat([tone(1), quiet(0.3), tone(0.2, 3_000)]);
    expect(seconds(trimTrailingNoise(clip, RATE))).toBeCloseTo(1.15, 1);
  });

  it("keeps a last stretch that is long enough to be speech", () => {
    const clip = Buffer.concat([tone(1), quiet(0.3), tone(0.8)]);
    expect(seconds(trimTrailingNoise(clip, RATE))).toBeCloseTo(2.1, 1);
  });

  it("keeps a clip that is one stretch of speech, however short", () => {
    const clip = tone(0.3);
    expect(trimTrailingNoise(clip, RATE).length).toBe(clip.length);
  });

  it("fades the end out", () => {
    const clip = tone(1.05);
    const last = (pcm: Buffer) => Math.abs(pcm.readInt16LE(pcm.length - 2));
    expect(last(clip)).toBeGreaterThan(100);
    expect(last(trimTrailingNoise(clip, RATE))).toBeLessThan(5);
  });

  it("leaves silence and clips shorter than a window alone", () => {
    expect(trimTrailingNoise(quiet(1), RATE).length).toBe(quiet(1).length);
    expect(trimTrailingNoise(tone(0.005), RATE).length).toBe(tone(0.005).length);
  });
});

import type { SpeechProvider } from "@/lib/ai/speech/provider";

/** What a speech provider charges, in micro-dollars (millionths of a dollar).
 *  An estimate from published rates; check it against invoices. */

/** Murf charges about $0.01 per 1,000 characters and Google WaveNet $4 per million
 *  (after a monthly free tier). ElevenLabs' rate isn't known here, so a clip it made
 *  has no cost to record (null). */
export function speechCostMicroUsd(provider: SpeechProvider, characters: number) {
  if (provider === "murf") return characters * 10;
  if (provider === "google") return characters * 4;
  return null;
}

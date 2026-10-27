import { NARRATION_PAUSE } from "../pause";

// Google rejects a request over 5,000 bytes; the SSML wrapper and pause tags take a little of it.
const GOOGLE_CHUNK_BYTES = 4_500;

const byteLength = (text: string) => Buffer.byteLength(text, "utf8");

/** Splits a script into pieces of at most `limit` bytes, at pauses and paragraph breaks first,
 *  then at sentence ends, so no piece cuts a sentence unless one sentence is over the limit. */
export function chunkScript(script: string, limit = GOOGLE_CHUNK_BYTES): string[] {
  const pause = NARRATION_PAUSE.replace(/[{}]/g, "\\$&");
  const units = script
    .split(new RegExp(`(?<=${pause}|\\n\\n)`))
    .flatMap((unit) => splitOversize(unit, limit));

  const chunks: string[] = [];
  let current = "";
  for (const unit of units) {
    if (current && byteLength(current + unit) > limit) {
      chunks.push(current);
      current = "";
    }
    current += unit;
  }
  if (current) chunks.push(current);
  return chunks;
}

function splitOversize(unit: string, limit: number): string[] {
  if (byteLength(unit) <= limit) return [unit];
  const sentences = unit.split(/(?<=[.!?。！？])\s*/);
  const pieces: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    for (const part of hardSplit(sentence, limit)) {
      if (current && byteLength(current + part) > limit) {
        pieces.push(current);
        current = "";
      }
      current += part;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

// A single sentence over the limit: cut by characters so no multi-byte character is split.
function hardSplit(text: string, limit: number): string[] {
  if (byteLength(text) <= limit) return [text];
  const parts: string[] = [];
  let current = "";
  for (const char of text) {
    if (byteLength(current + char) > limit) {
      parts.push(current);
      current = "";
    }
    current += char;
  }
  if (current) parts.push(current);
  return parts;
}

import { describe, expect, it } from "vitest";
import { chunkScript } from "./google-chunks";

const bytes = (text: string) => Buffer.byteLength(text, "utf8");

describe("chunkScript", () => {
  it("keeps a short script in one piece", () => {
    expect(chunkScript("Closure. {{pause}} A function.")).toEqual([
      "Closure. {{pause}} A function.",
    ]);
  });

  it("splits between paragraphs when the script is over the limit", () => {
    const paragraph = "Word. ".repeat(10).trim();
    const chunks = chunkScript(`${paragraph}\n\n${paragraph}\n\n${paragraph}`, 70);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join("")).toBe(`${paragraph}\n\n${paragraph}\n\n${paragraph}`);
    expect(chunks.every((chunk) => bytes(chunk) <= 70)).toBe(true);
  });

  it("counts bytes, so Japanese text splits earlier than its length suggests", () => {
    const sentence = "これは文です。";
    const script = sentence.repeat(20);
    const chunks = chunkScript(script, 100);
    expect(chunks.every((chunk) => bytes(chunk) <= 100)).toBe(true);
    expect(chunks.join("")).toBe(script);
  });

  it("cuts a single sentence over the limit without splitting a character", () => {
    const script = "あ".repeat(100);
    const chunks = chunkScript(script, 30);
    expect(chunks.every((chunk) => bytes(chunk) <= 30)).toBe(true);
    expect(chunks.join("")).toBe(script);
  });
});

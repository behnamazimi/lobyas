import { Mp3Encoder } from "@breezystack/lamejs";
import { renderPauses } from "../pause";
import { chunkScript } from "./google-chunks";
import type { SpeechProviderAdapter } from "./types";

const MODEL = "gemini-3.8-flash-tts";
// A Gemini voice speaks any language, so one voice serves them all.
const VOICE = "Charon";
// Short enough that the fallback still fits in the story narration route's 60 second limit.
const REQUEST_TIMEOUT_MS = 25_000;
// Not documented for this model; kept under the 4,000 bytes the earlier Gemini TTS models accept.
const CHUNK_BYTES = 3_500;
const DEFAULT_SAMPLE_RATE = 24_000;
const MP3_KBPS = 64;
const WAV_HEADER_BYTES = 44;

// Lets tests point at a local stub; unset in every real environment.
const endpoint = () =>
  `${process.env.GEMINI_BASE_URL ?? "https://aiplatform.googleapis.com"}/v1/publishers/google/models/${MODEL}:generateContent`;

type GenerateContentResponse = {
  candidates?: { content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[];
};

/** Raw 16-bit mono PCM of one chunk, and its sample rate. */
async function synthesizeChunk(
  chunk: string,
  apiKey: string,
): Promise<{ pcm: Buffer; sampleRate: number }> {
  const response = await fetch(endpoint(), {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: renderPauses(chunk, "gemini") }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
      },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new Error(`Gemini returned ${response.status}${detail ? `: ${detail}` : ""}`);
  }

  const body = (await response.json()) as GenerateContentResponse;
  const parts = body.candidates?.[0]?.content?.parts ?? [];
  const audio = parts.flatMap((part) => (part.inlineData?.data ? [part.inlineData] : []));
  if (audio.length === 0) throw new Error("Gemini returned no audio.");

  const sampleRate = Number(audio[0]!.mimeType?.match(/rate=(\d+)/)?.[1]) || DEFAULT_SAMPLE_RATE;
  const pcm = Buffer.concat(audio.map((part) => stripWavHeader(Buffer.from(part.data!, "base64"))));
  return { pcm, sampleRate };
}

// The API sends headerless PCM; a WAV header, if one ever comes, must not be encoded as sound.
function stripWavHeader(audio: Buffer): Buffer {
  return audio.subarray(0, 4).toString("ascii") === "RIFF"
    ? audio.subarray(WAV_HEADER_BYTES)
    : audio;
}

export function encodeMp3(pcm: Buffer, sampleRate: number): Buffer {
  const samples = new Int16Array(Math.floor(pcm.length / 2));
  for (let i = 0; i < samples.length; i++) samples[i] = pcm.readInt16LE(i * 2);

  const encoder = new Mp3Encoder(1, sampleRate, MP3_KBPS);
  const frames: Uint8Array[] = [];
  for (let i = 0; i < samples.length; i += 1152) {
    frames.push(encoder.encodeBuffer(samples.subarray(i, i + 1152)));
  }
  frames.push(encoder.flush());
  // The encoder hands back Int8Array views, which Buffer.concat rejects.
  return Buffer.concat(frames.map((f) => Buffer.from(f.buffer, f.byteOffset, f.byteLength)));
}

export const geminiProvider: SpeechProviderAdapter = {
  id: "gemini",
  isConfigured: () => Boolean(process.env.GEMINI_TTS_API_KEY?.trim()),
  async synthesize({ script }) {
    const apiKey = process.env.GEMINI_TTS_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_TTS_API_KEY.");

    console.log("================================================");
    console.log(apiKey?.slice(-4), "...");
    console.log("================================================");

    const chunks: Buffer[] = [];
    let sampleRate = DEFAULT_SAMPLE_RATE;
    for (const chunk of chunkScript(script, CHUNK_BYTES)) {
      const part = await synthesizeChunk(chunk, apiKey);
      chunks.push(part.pcm);
      sampleRate = part.sampleRate;
    }
    return encodeMp3(Buffer.concat(chunks), sampleRate);
  },
};

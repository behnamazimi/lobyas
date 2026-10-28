import type { CollectionLanguage } from "@/lib/terms/languages";
import { renderPauses } from "../pause";
import { chunkScript } from "./google-chunks";
import type { SpeechProviderAdapter } from "./types";

// Short enough that the fallback still fits in the story narration route's 60 second limit.
const REQUEST_TIMEOUT_MS = 25_000;

// Lets tests point at a local stub; unset in every real environment.
const endpoint = () =>
  `${process.env.GOOGLE_TTS_BASE_URL ?? "https://texttospeech.googleapis.com"}/v1/text:synthesize`;

/** One call to Cloud Text-to-Speech. */
async function synthesizeChunk(
  ssml: string,
  voice: { name: string; languageCode: string },
  apiKey: string,
): Promise<Buffer> {
  const response = await fetch(endpoint(), {
    method: "POST",
    headers: { "X-Goog-Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { ssml },
      voice,
      audioConfig: { audioEncoding: "MP3" },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new Error(`Google returned ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  const body = (await response.json()) as { audioContent?: string };
  const audio = body.audioContent ? Buffer.from(body.audioContent, "base64") : null;
  if (!audio || audio.length === 0) throw new Error("Google returned no audio.");
  return audio;
}

// One male WaveNet voice per language. WaveNet takes no style prompt.
const WAVENET_VOICES: Record<CollectionLanguage, { name: string; languageCode: string }> = {
  en: { name: "en-US-Wavenet-D", languageCode: "en-US" },
  nl: { name: "nl-NL-Wavenet-G", languageCode: "nl-NL" },
  es: { name: "es-ES-Wavenet-E", languageCode: "es-ES" },
  fr: { name: "fr-FR-Wavenet-G", languageCode: "fr-FR" },
  de: { name: "de-DE-Wavenet-H", languageCode: "de-DE" },
  it: { name: "it-IT-Wavenet-F", languageCode: "it-IT" },
  pt: { name: "pt-BR-Wavenet-B", languageCode: "pt-BR" },
  ru: { name: "ru-RU-Wavenet-B", languageCode: "ru-RU" },
  tr: { name: "tr-TR-Wavenet-B", languageCode: "tr-TR" },
  ja: { name: "ja-JP-Wavenet-C", languageCode: "ja-JP" },
  ko: { name: "ko-KR-Wavenet-C", languageCode: "ko-KR" },
  zh: { name: "cmn-CN-Wavenet-B", languageCode: "cmn-CN" },
};

const escapeXml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// The limit is 5,000 bytes per request; the SSML wrapper and pause tags take some of it.
const CHUNK_BYTES = 4_500;

export const googleProvider: SpeechProviderAdapter = {
  id: "google",
  isConfigured: () => Boolean(process.env.GOOGLE_TTS_API_KEY?.trim()),
  supports: (language) => language in WAVENET_VOICES,
  async synthesize({ script, language }) {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_TTS_API_KEY.");

    const parts: Buffer[] = [];
    for (const chunk of chunkScript(script, CHUNK_BYTES)) {
      const ssml = `<speak>${renderPauses(escapeXml(chunk), "google")}</speak>`;
      parts.push(await synthesizeChunk(ssml, WAVENET_VOICES[language], apiKey));
    }
    return Buffer.concat(parts);
  },
};

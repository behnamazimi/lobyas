import type { CollectionLanguage } from "@/lib/terms/languages";
import { renderPauses } from "../pause";
import { chunkScript } from "./google-chunks";
import type { SpeechProviderAdapter } from "./types";

// Short enough that the fallback still fits in the story narration route's 60 second limit.
const REQUEST_TIMEOUT_MS = 25_000;

// Lets tests point at a local stub; unset in every real environment.
const endpoint = () =>
  `${process.env.GOOGLE_TTS_BASE_URL ?? "https://texttospeech.googleapis.com"}/v1/text:synthesize`;

type SynthesizeRequest = { input: object; voice: object };

/** One call to Cloud Text-to-Speech, which WaveNet and Gemini voices share. */
async function synthesizeChunk(request: SynthesizeRequest, apiKey: string): Promise<Buffer> {
  const response = await fetch(endpoint(), {
    method: "POST",
    headers: { "X-Goog-Api-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ ...request, audioConfig: { audioEncoding: "MP3" } }),
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

function cloudTtsProvider(options: {
  id: "google" | "gemini";
  supports: (language: CollectionLanguage) => boolean;
  /** Each request carries at most this many bytes of the script. */
  chunkBytes: number;
  requestFor: (chunk: string, language: CollectionLanguage) => SynthesizeRequest;
}): SpeechProviderAdapter {
  return {
    id: options.id,
    isConfigured: () => Boolean(process.env.GOOGLE_TTS_API_KEY?.trim()),
    supports: options.supports,
    async synthesize({ script, language }) {
      const apiKey = process.env.GOOGLE_TTS_API_KEY;
      if (!apiKey) throw new Error("Missing GOOGLE_TTS_API_KEY.");

      const parts: Buffer[] = [];
      for (const chunk of chunkScript(script, options.chunkBytes)) {
        parts.push(await synthesizeChunk(options.requestFor(chunk, language), apiKey));
      }
      return Buffer.concat(parts);
    },
  };
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

export const googleProvider = cloudTtsProvider({
  id: "google",
  supports: (language) => language in WAVENET_VOICES,
  // The limit is 5,000 bytes; the SSML wrapper and pause tags take some of it.
  chunkBytes: 4_500,
  requestFor: (chunk, language) => ({
    input: { ssml: `<speak>${renderPauses(escapeXml(chunk), "google")}</speak>` },
    voice: WAVENET_VOICES[language],
  }),
});

const GEMINI_MODEL = "gemini-3.1-flash-tts-preview";
// A Gemini voice speaks any language; the locale decides the accent.
const GEMINI_VOICE = "Charon";
const GEMINI_STYLE = "Neutral and friendly.";

const GEMINI_LOCALES: Record<CollectionLanguage, string> = {
  en: "en-US",
  nl: "nl-NL",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-BR",
  ru: "ru-RU",
  tr: "tr-TR",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "cmn-CN",
};

export const geminiProvider = cloudTtsProvider({
  id: "gemini",
  supports: (language) => language in GEMINI_LOCALES,
  // The text limit is 4,000 bytes; the pause tags take some of it.
  chunkBytes: 3_500,
  requestFor: (chunk, language) => ({
    input: { text: renderPauses(chunk, "gemini"), prompt: GEMINI_STYLE },
    voice: { languageCode: GEMINI_LOCALES[language], name: GEMINI_VOICE, modelName: GEMINI_MODEL },
  }),
});

import type { SpeechProvider } from "./providers/types";

export const PROVIDER_LABELS: Record<SpeechProvider, string> = {
  google: "Google WaveNet",
  gemini: "Gemini",
  murf: "Murf",
  elevenlabs: "ElevenLabs",
};

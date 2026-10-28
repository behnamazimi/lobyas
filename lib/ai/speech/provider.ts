import { elevenLabsProvider } from "./providers/elevenlabs";
import { geminiProvider } from "./providers/gemini";
import { googleProvider } from "./providers/google";
import { murfProvider } from "./providers/murf";
import type { SpeechProvider, SpeechProviderAdapter, SynthesisRequest } from "./providers/types";

export type { SpeechProvider } from "./providers/types";

/** An admin can switch Murf and ElevenLabs off; the others are used whenever they have a key. */
export type ProviderSwitches = Partial<Record<SpeechProvider, boolean>>;

export type ProviderCall = { provider: SpeechProvider; units: number; outcome: "ok" | "failed" };

const ADAPTERS: SpeechProviderAdapter[] = [
  murfProvider,
  elevenLabsProvider,
  googleProvider,
  geminiProvider,
];

/** The selected provider first, then the others in their usual order as fallbacks. */
function orderedAdapters(primary: SpeechProvider): SpeechProviderAdapter[] {
  return [...ADAPTERS].sort((a, b) => Number(b.id === primary) - Number(a.id === primary));
}

/** Carries every provider call made, so failed attempts are still counted. */
export class SpeechSynthesisError extends Error {
  constructor(
    message: string,
    readonly calls: ProviderCall[],
  ) {
    super(message);
  }
}

/** Whether each provider's API key is set, regardless of the admin switches. */
export function configuredProviders(): Record<SpeechProvider, boolean> {
  return {
    murf: murfProvider.isConfigured(),
    elevenlabs: elevenLabsProvider.isConfigured(),
    google: googleProvider.isConfigured(),
    gemini: geminiProvider.isConfigured(),
  };
}

export async function synthesizeSpeech(
  request: SynthesisRequest,
  switches: ProviderSwitches,
  primary: SpeechProvider,
): Promise<{ audio: Buffer; provider: SpeechProvider; calls: ProviderCall[] }> {
  const calls: ProviderCall[] = [];
  const units = request.script.length;
  const errors: string[] = [];

  for (const adapter of orderedAdapters(primary)) {
    if (switches[adapter.id] === false || !adapter.isConfigured()) continue;
    if (adapter.supports && !adapter.supports(request.language)) continue;
    try {
      const audio = await adapter.synthesize(request);
      calls.push({ provider: adapter.id, units, outcome: "ok" });
      return { audio, provider: adapter.id, calls };
    } catch (err) {
      calls.push({ provider: adapter.id, units, outcome: "failed" });
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Narration provider ${adapter.id} failed:`, err);
      errors.push(`${adapter.id}: ${message}`);
    }
  }

  throw new SpeechSynthesisError(
    errors.length > 0 ? errors.join("; ") : "No narration provider is available.",
    calls,
  );
}

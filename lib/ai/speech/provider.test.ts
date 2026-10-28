import { beforeEach, describe, expect, it, vi } from "vitest";

const murf = vi.hoisted(() => ({
  id: "murf",
  isConfigured: vi.fn(),
  synthesize: vi.fn(),
  supports: undefined as undefined | ((language: string) => boolean),
}));
const eleven = vi.hoisted(() => ({ id: "elevenlabs", isConfigured: vi.fn(), synthesize: vi.fn() }));
const google = vi.hoisted(() => ({ id: "google", isConfigured: vi.fn(), synthesize: vi.fn() }));
const gemini = vi.hoisted(() => ({ id: "gemini", isConfigured: vi.fn(), synthesize: vi.fn() }));

vi.mock("./providers/murf", () => ({ murfProvider: murf }));
vi.mock("./providers/elevenlabs", () => ({ elevenLabsProvider: eleven }));
vi.mock("./providers/google", () => ({ googleProvider: google }));
vi.mock("./providers/gemini", () => ({ geminiProvider: gemini }));
vi.spyOn(console, "error").mockImplementation(() => undefined);

const { synthesizeSpeech, SpeechSynthesisError, configuredProviders } = await import("./provider");

const request = { script: "Closure.", language: "en" as const, kind: "term" as const };
const both = { murf: true, elevenlabs: true };

beforeEach(() => {
  vi.resetAllMocks();
  murf.supports = undefined;
  murf.isConfigured.mockReturnValue(true);
  eleven.isConfigured.mockReturnValue(true);
  google.isConfigured.mockReturnValue(false);
  gemini.isConfigured.mockReturnValue(false);
  murf.synthesize.mockResolvedValue(Buffer.from("murf"));
  eleven.synthesize.mockResolvedValue(Buffer.from("eleven"));
  google.synthesize.mockResolvedValue(Buffer.from("google"));
  gemini.synthesize.mockResolvedValue(Buffer.from("gemini"));
});

describe("synthesizeSpeech", () => {
  it("tries the selected provider first and keeps the others as fallbacks", async () => {
    google.isConfigured.mockReturnValue(true);
    google.synthesize.mockRejectedValue(new Error("down"));
    const result = await synthesizeSpeech(request, both, "google");
    expect(result.provider).toBe("murf");
    expect(result.calls.map((call) => [call.provider, call.outcome])).toEqual([
      ["google", "failed"],
      ["murf", "ok"],
    ]);
  });

  it("uses the selected provider alone when it works", async () => {
    google.isConfigured.mockReturnValue(true);
    const result = await synthesizeSpeech(request, both, "google");
    expect(result.provider).toBe("google");
    expect(murf.synthesize).not.toHaveBeenCalled();
  });

  it("skips a provider with no voice for the language, without counting a failed call", async () => {
    murf.supports = () => false;
    const result = await synthesizeSpeech({ ...request, language: "ru" }, both, "murf");
    expect(result.provider).toBe("elevenlabs");
    expect(result.calls.map((c) => [c.provider, c.outcome])).toEqual([["elevenlabs", "ok"]]);
    expect(murf.synthesize).not.toHaveBeenCalled();
  });

  it("uses Murf first and does not call ElevenLabs", async () => {
    const result = await synthesizeSpeech(request, both, "murf");
    expect(result.provider).toBe("murf");
    expect(result.calls).toEqual([{ provider: "murf", units: 8, outcome: "ok" }]);
    expect(eleven.synthesize).not.toHaveBeenCalled();
  });

  it("falls back to ElevenLabs when Murf fails and reports both calls", async () => {
    murf.synthesize.mockRejectedValue(new Error("down"));
    const result = await synthesizeSpeech(request, both, "murf");
    expect(result.provider).toBe("elevenlabs");
    expect(result.audio.toString()).toBe("eleven");
    expect(result.calls.map((c) => [c.provider, c.outcome])).toEqual([
      ["murf", "failed"],
      ["elevenlabs", "ok"],
    ]);
  });

  it("skips a provider that is switched off", async () => {
    const result = await synthesizeSpeech(request, { murf: false, elevenlabs: true }, "murf");
    expect(result.provider).toBe("elevenlabs");
    expect(murf.synthesize).not.toHaveBeenCalled();
  });

  it("skips a provider with no key", async () => {
    murf.isConfigured.mockReturnValue(false);
    expect((await synthesizeSpeech(request, both, "murf")).provider).toBe("elevenlabs");
  });

  it("does not fall back to a provider the admin switched off", async () => {
    murf.synthesize.mockRejectedValue(new Error("down"));
    await expect(
      synthesizeSpeech(request, { murf: true, elevenlabs: false }, "murf"),
    ).rejects.toThrow("murf: down");
    expect(eleven.synthesize).not.toHaveBeenCalled();
  });

  it("throws with every attempt when all fail", async () => {
    murf.synthesize.mockRejectedValue(new Error("a"));
    eleven.synthesize.mockRejectedValue(new Error("b"));
    const error = await synthesizeSpeech(request, both, "murf").catch((e) => e);
    expect(error).toBeInstanceOf(SpeechSynthesisError);
    expect(error.message).toBe("murf: a; elevenlabs: b");
    expect(error.calls).toHaveLength(2);
  });

  it("says so when no provider is usable", async () => {
    const error = await synthesizeSpeech(request, { murf: false, elevenlabs: false }, "murf").catch(
      (e) => e,
    );
    expect(error.message).toBe("No narration provider is available.");
    expect(error.calls).toEqual([]);
  });
});

describe("configuredProviders", () => {
  it("reports which keys are set", () => {
    eleven.isConfigured.mockReturnValue(false);
    expect(configuredProviders()).toEqual({
      murf: true,
      elevenlabs: false,
      google: false,
      gemini: false,
    });
  });
});

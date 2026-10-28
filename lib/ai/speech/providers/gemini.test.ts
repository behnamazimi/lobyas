import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { encodeMp3, geminiProvider } from "./gemini";

const fetchMock = vi.fn();
const SECOND_OF_SILENCE = Buffer.alloc(24_000 * 2);
const reply = (pcm: Buffer, mimeType = "audio/L16;codec=pcm;rate=24000") =>
  new Response(
    JSON.stringify({
      candidates: [
        { content: { parts: [{ inlineData: { mimeType, data: pcm.toString("base64") } }] } },
      ],
    }),
  );

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("GEMINI_API_KEY", "key");
  fetchMock.mockImplementation(async () => reply(SECOND_OF_SILENCE));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

const request = {
  script: "Tom & Jerry {{pause}} <b>",
  language: "ja" as const,
  kind: "term" as const,
};
const isMp3 = (audio: Buffer) => audio[0] === 0xff && (audio[1]! & 0xe0) === 0xe0;

describe("geminiProvider", () => {
  it("asks for audio with the key in a header, the style first and a pause tag", async () => {
    const audio = await geminiProvider.synthesize(request);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(
      "https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-3.8-flash-tts:generateContent",
    );
    expect(init.headers["x-goog-api-key"]).toBe("key");
    expect(JSON.parse(init.body)).toMatchObject({
      contents: [
        {
          role: "user",
          parts: [{ text: "Say in a neutral and friendly tone:\nTom & Jerry <long pause> <b>" }],
        },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } },
      },
    });
    expect(isMp3(audio)).toBe(true);
  });

  it("encodes the PCM of every chunk into one MP3", async () => {
    const script = `${"x".repeat(2_000)}\n\n${"y".repeat(2_000)}`;
    const audio = await geminiProvider.synthesize({ ...request, script });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(audio.length).toBeGreaterThan(encodeMp3(SECOND_OF_SILENCE, 24_000).length);
  });

  it("does not encode a WAV header as sound", async () => {
    const header = Buffer.alloc(44);
    header.write("RIFF");
    fetchMock.mockImplementation(async () => reply(Buffer.concat([header, SECOND_OF_SILENCE])));
    const audio = await geminiProvider.synthesize(request);
    expect(audio.length).toBe(encodeMp3(SECOND_OF_SILENCE, 24_000).length);
  });

  it("fails on an error response and on a reply with no audio", async () => {
    fetchMock.mockResolvedValueOnce(new Response("denied", { status: 403 }));
    await expect(geminiProvider.synthesize(request)).rejects.toThrow("Gemini returned 403: denied");

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ candidates: [] })));
    await expect(geminiProvider.synthesize(request)).rejects.toThrow("no audio");
  });

  it("is unconfigured without a key", () => {
    vi.stubEnv("GEMINI_API_KEY", " ");
    expect(geminiProvider.isConfigured()).toBe(false);
  });
});

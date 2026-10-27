import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { geminiProvider, googleProvider } from "./google";

const fetchMock = vi.fn();
const audio = (text: string) =>
  new Response(JSON.stringify({ audioContent: Buffer.from(text).toString("base64") }));

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("GOOGLE_TTS_API_KEY", "key");
  fetchMock.mockResolvedValue(audio("mp3"));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

const request = {
  script: "Tom & Jerry {{pause}} <b>",
  language: "nl" as const,
  kind: "term" as const,
};

describe("googleProvider", () => {
  it("sends escaped SSML with a break, the key header and the language's voice", async () => {
    expect((await googleProvider.synthesize(request)).toString()).toBe("mp3");

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://texttospeech.googleapis.com/v1/text:synthesize");
    expect(init.headers["X-Goog-Api-Key"]).toBe("key");
    expect(JSON.parse(init.body)).toMatchObject({
      input: { ssml: '<speak>Tom &amp; Jerry <break time="1s"/> &lt;b&gt;</speak>' },
      voice: { name: "nl-NL-Wavenet-G", languageCode: "nl-NL" },
      audioConfig: { audioEncoding: "MP3" },
    });
  });

  it("joins the audio of every chunk of a long script", async () => {
    fetchMock.mockResolvedValueOnce(audio("a")).mockResolvedValueOnce(audio("b"));
    const script = `${"x".repeat(4_000)}\n\n${"y".repeat(4_000)}`;
    const result = await googleProvider.synthesize({ ...request, script });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.toString()).toBe("ab");
  });

  it("fails on an error response and on empty audio", async () => {
    fetchMock.mockResolvedValueOnce(new Response("quota", { status: 429 }));
    await expect(googleProvider.synthesize(request)).rejects.toThrow("Google returned 429: quota");

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({})));
    await expect(googleProvider.synthesize(request)).rejects.toThrow("no audio");
  });

  it("is unconfigured without a key", () => {
    vi.stubEnv("GOOGLE_TTS_API_KEY", " ");
    expect(googleProvider.isConfigured()).toBe(false);
  });
});

describe("geminiProvider", () => {
  it("sends the text with pause tags, the style prompt and the model, unescaped", async () => {
    await geminiProvider.synthesize({ ...request, language: "ja" });

    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toMatchObject({
      input: { text: "Tom & Jerry [long pause] <b>", prompt: "Neutral and friendly." },
      voice: { languageCode: "ja-JP", name: "Charon", modelName: "gemini-3.1-flash-tts-preview" },
      audioConfig: { audioEncoding: "MP3" },
    });
  });

  it("splits a script under Gemini's smaller 4,000-byte text limit", async () => {
    const script = `${"x".repeat(2_000)}\n\n${"y".repeat(2_000)}`;
    fetchMock.mockImplementation(async () => audio("mp3"));
    await geminiProvider.synthesize({ ...request, script });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

import { describe, expect, it, vi } from "vitest";
import { getProviderSettings } from "./switches";

function client(options: { features?: unknown; route?: unknown }) {
  const featureEq = vi.fn(() => ({
    single: async () => options.features ?? { data: null, error: new Error("missing") },
  }));
  const routeEq = vi.fn(() => ({
    single: async () => options.route ?? { data: null, error: new Error("missing") },
  }));
  const from = vi.fn((table: string) => ({
    select: () => ({ eq: table === "narration_routes" ? routeEq : featureEq }),
  }));
  return { admin: { from } as never, featureEq, routeEq };
}

const features = { data: { murf_enabled: true, elevenlabs_enabled: false }, error: null };
const route = { data: { provider: "gemini" }, error: null };

describe("getProviderSettings", () => {
  it("reads the switches of the clip type and the provider for its route", async () => {
    const term = client({ features, route });
    expect(await getProviderSettings(term.admin, { type: "term", route: "vocab_term" })).toEqual({
      switches: { murf: true, elevenlabs: false },
      primary: "gemini",
    });
    expect(term.featureEq).toHaveBeenCalledWith("feature", "narration_term");
    expect(term.routeEq).toHaveBeenCalledWith("route", "vocab_term");

    const story = client({ features, route });
    await getProviderSettings(story.admin, { type: "story", route: "story" });
    expect(story.featureEq).toHaveBeenCalledWith("feature", "narration_story");
  });

  it("throws when the switches or the route can't be read", async () => {
    await expect(
      getProviderSettings(client({ route }).admin, { type: "term", route: "term" }),
    ).rejects.toThrow("missing");
    await expect(
      getProviderSettings(client({ features }).admin, { type: "term", route: "term" }),
    ).rejects.toThrow("missing");
  });
});

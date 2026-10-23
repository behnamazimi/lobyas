import { afterEach, describe, expect, it, vi } from "vitest";
import { callNative } from "./call";

const APP_UA = "Mozilla/5.0 Chrome/126 Mobile Safari/537.36 LobyasApp/android/1.0.0";

function asApp({ plugins }: { plugins: string[] }) {
  vi.stubGlobal("navigator", { userAgent: APP_UA });
  vi.stubGlobal("Capacitor", { isPluginAvailable: (name: string) => plugins.includes(name) });
}

const load = () => Promise.resolve({ haptic: () => Promise.resolve("buzzed") });

afterEach(() => vi.unstubAllGlobals());

describe("callNative", () => {
  it("is unavailable in a browser, without loading the plugin", async () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 Chrome/126" });
    const loader = vi.fn(load);
    expect(await callNative("haptics", loader, (m) => m.haptic())).toEqual({
      status: "unavailable",
    });
    expect(loader).not.toHaveBeenCalled();
  });

  it("is unavailable in an app built without the plugin", async () => {
    asApp({ plugins: [] });
    expect(await callNative("haptics", load, (m) => m.haptic())).toEqual({ status: "unavailable" });
  });

  it("returns the value from an app that has the plugin", async () => {
    asApp({ plugins: ["Haptics"] });
    expect(await callNative("haptics", load, (m) => m.haptic())).toEqual({
      status: "ok",
      value: "buzzed",
    });
  });

  it("treats a method an older app lacks as unavailable", async () => {
    asApp({ plugins: ["Haptics"] });
    const result = await callNative("haptics", load, () =>
      Promise.reject({ code: "UNIMPLEMENTED" }),
    );
    expect(result).toEqual({ status: "unavailable" });
  });

  it("reports any other error as failed instead of throwing", async () => {
    asApp({ plugins: ["Haptics"] });
    const error = new Error("boom");
    expect(await callNative("haptics", load, () => Promise.reject(error))).toEqual({
      status: "failed",
      error,
    });
  });

  it("reports a plugin that can't be loaded as failed", async () => {
    asApp({ plugins: ["Haptics"] });
    const result = await callNative(
      "haptics",
      () => Promise.reject(new Error("chunk")),
      (m) => m,
    );
    expect(result.status).toBe("failed");
  });
});

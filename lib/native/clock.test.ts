import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const plugin = vi.hoisted(() => ({
  is24Hour: false,
  calls: 0,
  registered: 0,
  resume: null as null | (() => void),
}));

vi.mock("@capacitor/core", () => ({
  registerPlugin: () => {
    plugin.registered++;
    return {
      getClock: async () => {
        plugin.calls++;
        return { is24Hour: plugin.is24Hour };
      },
    };
  },
}));
vi.mock("./events", () => ({
  onAppResume: (callback: () => void) => {
    plugin.resume = callback;
    return () => void (plugin.resume = null);
  },
}));

const store = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
});

const { clockUses24Hours, languageUses24HourClock, resetClock, subscribeToClock } =
  await import("./clock");

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function asApp(plugins: string[]) {
  vi.stubGlobal("navigator", { userAgent: "Chrome/126 LobyasApp/android/1.0.0" });
  vi.stubGlobal("Capacitor", { isPluginAvailable: (name: string) => plugins.includes(name) });
}

beforeEach(() => {
  store.clear();
  resetClock();
  Object.assign(plugin, { is24Hour: false, calls: 0, registered: 0, resume: null });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  });
});

describe("the phone's clock", () => {
  it("is the language's default until the app answers", () => {
    asApp(["LobyasNative"]);
    expect(clockUses24Hours()).toBe(languageUses24HourClock());
  });

  it("follows what the app reports, and tells subscribers when it changes", async () => {
    asApp(["LobyasNative"]);
    plugin.is24Hour = true;
    const listener = vi.fn();
    const stop = subscribeToClock(listener);
    await settle();
    expect(clockUses24Hours()).toBe(true);
    expect(listener).toHaveBeenCalledOnce();
    stop();
  });

  it("asks again when the app comes back, in case the setting changed meanwhile", async () => {
    asApp(["LobyasNative"]);
    const listener = vi.fn();
    const stop = subscribeToClock(listener);
    await settle();
    plugin.is24Hour = true;
    plugin.resume?.();
    await settle();
    expect(clockUses24Hours()).toBe(true);
    stop();
    expect(plugin.resume).toBeNull();
  });

  it("registers the plugin once however often it asks", async () => {
    asApp(["LobyasNative"]);
    const stop = subscribeToClock(() => {});
    await settle();
    plugin.resume?.();
    await settle();
    expect(plugin.registered).toBe(1);
    stop();
  });

  it("keeps the language's default in an app built without the plugin, without calling it", async () => {
    asApp([]);
    const stop = subscribeToClock(() => {});
    await settle();
    expect(plugin.calls).toBe(0);
    expect(clockUses24Hours()).toBe(languageUses24HourClock());
    stop();
  });

  it("keeps the last answer, so the next page load starts with it", async () => {
    asApp(["LobyasNative"]);
    plugin.is24Hour = !languageUses24HourClock();
    const stop = subscribeToClock(() => {});
    await settle();
    stop();
    resetClock();
    store.set("lb_clock_24h", plugin.is24Hour ? "1" : "0");
    expect(clockUses24Hours()).toBe(plugin.is24Hour);
  });

  it("tells subscribers nothing when the answer matches what the page already showed", async () => {
    asApp(["LobyasNative"]);
    store.set("lb_clock_24h", "1");
    plugin.is24Hour = true;
    const listener = vi.fn();
    const stop = subscribeToClock(listener);
    await settle();
    expect(listener).not.toHaveBeenCalled();
    expect(store.get("lb_clock_24h")).toBe("1");
    stop();
  });

  it("works when storage is blocked", async () => {
    asApp(["LobyasNative"]);
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {},
    });
    plugin.is24Hour = true;
    const stop = subscribeToClock(() => {});
    await settle();
    expect(clockUses24Hours()).toBe(true);
    stop();
  });
});

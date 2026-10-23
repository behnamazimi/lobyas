import { afterEach, describe, expect, it, vi } from "vitest";

const plugin = vi.hoisted(() => ({
  handlers: [] as Array<(state: { isActive: boolean }) => void>,
  removed: 0,
  deferAdd: null as null | ((value: unknown) => void),
}));

vi.mock("@capacitor/app", () => ({
  App: {
    addListener: (_event: string, handler: (state: { isActive: boolean }) => void) => {
      plugin.handlers.push(handler);
      const handle = { remove: async () => void plugin.removed++ };
      return new Promise((resolve) => {
        if (plugin.deferAdd) plugin.deferAdd = resolve.bind(null, handle) as never;
        else resolve(handle);
      });
    },
  },
}));

const { onAppResume } = await import("./events");

function asApp() {
  vi.stubGlobal("navigator", { userAgent: "Chrome/126 LobyasApp/android/1.0.0" });
  vi.stubGlobal("Capacitor", { isPluginAvailable: () => true });
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  vi.unstubAllGlobals();
  plugin.handlers.length = 0;
  plugin.removed = 0;
  plugin.deferAdd = null;
});

describe("onAppResume", () => {
  it("runs the callback when the app becomes active, not when it goes to the background", async () => {
    asApp();
    const callback = vi.fn();
    onAppResume(callback);
    await settle();
    plugin.handlers[0]({ isActive: false });
    expect(callback).not.toHaveBeenCalled();
    plugin.handlers[0]({ isActive: true });
    expect(callback).toHaveBeenCalledOnce();
  });

  it("removes the listener when stopped", async () => {
    asApp();
    const stop = onAppResume(() => {});
    await settle();
    stop();
    expect(plugin.removed).toBe(1);
  });

  it("removes a listener that was stopped before it was added", async () => {
    asApp();
    plugin.deferAdd = () => {};
    const stop = onAppResume(() => {});
    stop();
    await settle();
    plugin.deferAdd?.(undefined);
    await settle();
    expect(plugin.removed).toBe(1);
  });

  it("does nothing in a browser", async () => {
    vi.stubGlobal("navigator", { userAgent: "Chrome/126" });
    onAppResume(() => {});
    await settle();
    expect(plugin.handlers).toHaveLength(0);
  });
});

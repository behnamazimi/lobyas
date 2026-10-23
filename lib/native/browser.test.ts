import { afterEach, describe, expect, it, vi } from "vitest";

const plugin = vi.hoisted(() => ({ opened: [] as string[], closed: 0, fail: false }));

vi.mock("@capacitor/browser", () => ({
  Browser: {
    open: async ({ url }: { url: string }) => {
      if (plugin.fail) throw new Error("no browser");
      plugin.opened.push(url);
    },
    close: async () => void plugin.closed++,
  },
}));

const { closeSystemBrowser, openSystemBrowser } = await import("./browser");

function asApp() {
  vi.stubGlobal("navigator", { userAgent: "Chrome/126 LobyasApp/android/1.0.0" });
  vi.stubGlobal("Capacitor", { isPluginAvailable: () => true });
}

afterEach(() => {
  vi.unstubAllGlobals();
  plugin.opened.length = 0;
  plugin.closed = 0;
  plugin.fail = false;
});

describe("openSystemBrowser", () => {
  it("opens the page and says so", async () => {
    asApp();
    expect(await openSystemBrowser("https://example.test/auth")).toBe(true);
    expect(plugin.opened).toEqual(["https://example.test/auth"]);
  });

  it("says false when the browser can't open, and in a plain browser", async () => {
    asApp();
    plugin.fail = true;
    expect(await openSystemBrowser("https://example.test")).toBe(false);
    vi.unstubAllGlobals();
    expect(await openSystemBrowser("https://example.test")).toBe(false);
  });
});

describe("closeSystemBrowser", () => {
  it("closes it in the app", async () => {
    asApp();
    closeSystemBrowser();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(plugin.closed).toBe(1);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

const plugin = vi.hoisted(() => ({
  check: async () => ({ display: "prompt" }) as { display: string },
  request: async () => ({ display: "granted" }) as { display: string },
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    checkPermissions: () => plugin.check(),
    requestPermissions: () => plugin.request(),
  },
}));

const { notificationPermission, requestNotificationPermission } = await import("./notifications");

function asApp() {
  vi.stubGlobal("navigator", { userAgent: "Chrome/126 LobyasApp/android/1.0.0" });
  vi.stubGlobal("Capacitor", { isPluginAvailable: () => true, getPlatform: () => "android" });
}

afterEach(() => vi.unstubAllGlobals());

describe("notificationPermission", () => {
  it.each([
    ["granted", "granted"],
    ["denied", "denied"],
    ["prompt", "prompt"],
    ["prompt-with-rationale", "prompt"],
  ])("maps %s to %s", async (display, expected) => {
    asApp();
    plugin.check = async () => ({ display });
    expect(await notificationPermission()).toBe(expected);
  });

  it("is unavailable in a browser", async () => {
    vi.stubGlobal("navigator", { userAgent: "Chrome/126" });
    expect(await notificationPermission()).toBe("unavailable");
  });
});

describe("requestNotificationPermission", () => {
  it("says granted or denied from the system prompt", async () => {
    asApp();
    plugin.request = async () => ({ display: "granted" });
    expect(await requestNotificationPermission()).toBe("granted");
    plugin.request = async () => ({ display: "denied" });
    expect(await requestNotificationPermission()).toBe("denied");
  });

  it("is unavailable, not an error, when the prompt itself fails, so a save can go on", async () => {
    asApp();
    plugin.request = async () => Promise.reject(new Error("no activity"));
    expect(await requestNotificationPermission()).toBe("unavailable");
  });
});

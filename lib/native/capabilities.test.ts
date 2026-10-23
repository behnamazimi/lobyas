import { afterEach, describe, expect, it, vi } from "vitest";
import { hasCapability, nativePlatform } from "./capabilities";

function asApp(os: "ios" | "android", plugins: string[]) {
  vi.stubGlobal("navigator", { userAgent: `Chrome/126 LobyasApp/${os}/1.0.0` });
  vi.stubGlobal("Capacitor", {
    isPluginAvailable: (name: string) => plugins.includes(name),
    getPlatform: () => os,
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("hasCapability", () => {
  it("needs the plugin to be in the installed app", () => {
    asApp("android", []);
    expect(hasCapability("notifications")).toBe(false);
    asApp("android", ["LocalNotifications"]);
    expect(hasCapability("notifications")).toBe(true);
  });

  it("is false in a browser even if a Capacitor global exists", () => {
    vi.stubGlobal("navigator", { userAgent: "Chrome/126" });
    vi.stubGlobal("Capacitor", { isPluginAvailable: () => true });
    expect(hasCapability("haptics")).toBe(false);
  });

  it("keeps Apple sign-in to iOS, where the plugin is also installed on Android", () => {
    asApp("android", ["SocialLogin"]);
    expect(hasCapability("appleSignIn")).toBe(false);
    asApp("ios", ["SocialLogin"]);
    expect(hasCapability("appleSignIn")).toBe(true);
  });
});

describe("nativePlatform", () => {
  it("reads what Capacitor reports and is web without it", () => {
    asApp("ios", []);
    expect(nativePlatform()).toBe("ios");
    vi.unstubAllGlobals();
    expect(nativePlatform()).toBe("web");
  });
});

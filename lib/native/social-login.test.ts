import { afterEach, describe, expect, it, vi } from "vitest";

const plugin = vi.hoisted(() => ({
  login: null as null | (() => Promise<unknown>),
  initialized: [] as unknown[],
}));

vi.mock("@capgo/capacitor-social-login", () => ({
  SocialLogin: {
    initialize: async (options: unknown) => void plugin.initialized.push(options),
    login: () => plugin.login?.(),
  },
}));

const { signInWithAppleNative } = await import("./social-login");

function asIosApp() {
  vi.stubGlobal("navigator", { userAgent: "Chrome/126 LobyasApp/ios/1.0.0" });
  vi.stubGlobal("Capacitor", { isPluginAvailable: () => true, getPlatform: () => "ios" });
}

afterEach(() => {
  vi.unstubAllGlobals();
  plugin.login = null;
  plugin.initialized.length = 0;
});

describe("signInWithAppleNative", () => {
  it("returns the ID token Apple signed", async () => {
    asIosApp();
    plugin.login = async () => ({ result: { idToken: "token" } });
    expect(await signInWithAppleNative("hash")).toEqual({ status: "signed-in", idToken: "token" });
    expect(plugin.initialized).toHaveLength(1);
  });

  it("reports a cancelled sheet as cancelled, not as an error", async () => {
    asIosApp();
    plugin.login = async () => Promise.reject({ code: "USER_CANCELLED" });
    expect(await signInWithAppleNative("hash")).toEqual({ status: "cancelled" });
  });

  it("fails when Apple returns no token or the call errors", async () => {
    asIosApp();
    plugin.login = async () => ({ result: { idToken: null } });
    expect(await signInWithAppleNative("hash")).toEqual({ status: "failed" });
    plugin.login = async () => Promise.reject(new Error("boom"));
    expect(await signInWithAppleNative("hash")).toEqual({ status: "failed" });
  });

  it("fails outside the iOS app without calling the plugin", async () => {
    vi.stubGlobal("navigator", { userAgent: "Chrome/126" });
    plugin.login = async () => ({ result: { idToken: "token" } });
    expect(await signInWithAppleNative("hash")).toEqual({ status: "failed" });
    expect(plugin.initialized).toHaveLength(0);
  });
});

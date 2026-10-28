import { describe, expect, it } from "vitest";
import { hasRetriedSplashLoad, nextSplashStep, SPLASH_RESTORE_SCRIPT } from "./splash";

describe("nextSplashStep", () => {
  it.each([200, 204, 304, 403, 404, undefined, 0])("is ready for status %s", (status) => {
    expect(nextSplashStep({ status, retried: false })).toBe("ready");
  });

  it.each([500, 502, 503])("reloads once for status %s", (status) => {
    expect(nextSplashStep({ status, retried: false })).toBe("retry");
  });

  it("shows a server error after the reload", () => {
    expect(nextSplashStep({ status: 500, retried: true })).toBe("ready");
  });
});

describe("hasRetriedSplashLoad", () => {
  it("counts as retried when storage throws, so a broken storage can't loop", () => {
    const broken = {
      getItem() {
        throw new Error("blocked");
      },
    } as unknown as Storage;
    expect(hasRetriedSplashLoad(broken)).toBe(true);
  });
});

describe("SPLASH_RESTORE_SCRIPT", () => {
  function splashFor({ shell, done }: { shell: boolean; done?: boolean }) {
    const attributes = new Set<string>();
    const document = {
      documentElement: {
        hasAttribute: () => shell,
        setAttribute: (name: string) => attributes.add(name),
      },
    };
    const sessionStorage = { getItem: () => (done ? "1" : null) };
    new Function("document", "sessionStorage", SPLASH_RESTORE_SCRIPT)(document, sessionStorage);
    return attributes.has("data-splash");
  }

  it("shows the splash on a cold start in the app", () => {
    expect(splashFor({ shell: true })).toBe(true);
  });

  it("skips it once this web view has shown it", () => {
    expect(splashFor({ shell: true, done: true })).toBe(false);
  });

  it("skips it on the plain web", () => {
    expect(splashFor({ shell: false })).toBe(false);
  });
});

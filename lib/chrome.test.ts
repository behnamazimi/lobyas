import { describe, expect, it } from "vitest";
import { isStudyPath, navKey, ownsHeader, shellLayout, subPageFallback } from "./chrome";

describe("isStudyPath", () => {
  it("treats the app, admin and shared links as the app shell", () => {
    expect(isStudyPath("/app")).toBe(true);
    expect(isStudyPath("/app/library")).toBe(true);
    expect(isStudyPath("/admin/people")).toBe(true);
    expect(isStudyPath("/c/22222222-2222-2222-2222-222222222223")).toBe(true);
  });

  it("treats marketing, auth, and public glossary as the website", () => {
    expect(isStudyPath("/")).toBe(false);
    expect(isStudyPath("/login")).toBe(false);
    expect(isStudyPath("/collections/software")).toBe(false);
    expect(isStudyPath("/contact")).toBe(false);
    expect(isStudyPath("/how-terms-work")).toBe(false);
    expect(isStudyPath("/~offline")).toBe(false);
    expect(isStudyPath("/apple-icon")).toBe(false);
  });
});

describe("shellLayout", () => {
  it("gives the four destinations the tab bar", () => {
    expect(shellLayout("/app")).toBe("tabs");
    expect(shellLayout("/app/library")).toBe("tabs");
    expect(shellLayout("/app/goals")).toBe("tabs");
    expect(shellLayout("/app/me")).toBe("tabs");
  });

  it("treats Read, Stories, Review, Quiz and Triage as study", () => {
    expect(shellLayout("/app/read")).toBe("study");
    expect(shellLayout("/app/read/stories")).toBe("study");
    expect(shellLayout("/app/review")).toBe("study");
    expect(shellLayout("/app/quiz")).toBe("study");
    expect(shellLayout("/app/triage")).toBe("study");
  });

  it("treats the rest of the app as a sub-page and the website as the site", () => {
    expect(shellLayout("/app/settings")).toBe("sub");
    expect(shellLayout("/app/import/paste")).toBe("sub");
    expect(shellLayout("/admin")).toBe("sub");
    expect(shellLayout("/c/22222222-2222-2222-2222-222222222223")).toBe("sub");
    expect(shellLayout("/login")).toBe("site");
  });
});

describe("navKey", () => {
  it("names the destination and nothing else", () => {
    expect(navKey("/app")).toBe("home");
    expect(navKey("/app/library")).toBe("library");
    expect(navKey("/app/goals")).toBe("goals");
    expect(navKey("/app/me")).toBe("me");
    expect(navKey("/app/read")).toBeNull();
    expect(navKey("/app/settings")).toBeNull();
  });
});

describe("subPageFallback", () => {
  it("sends each sub-page to its parent when there is no history", () => {
    expect(subPageFallback("/app/settings")).toBe("/app/me");
    expect(subPageFallback("/app/mastery")).toBe("/app/me");
    expect(subPageFallback("/app/browse")).toBe("/app/me");
    expect(subPageFallback("/app/import")).toBe("/app/me");
    expect(subPageFallback("/app/import/paste")).toBe("/app/import");
    expect(subPageFallback("/app/capture")).toBe("/app/import");
    expect(subPageFallback("/admin")).toBe("/app/me");
    expect(subPageFallback("/admin/people")).toBe("/admin");
    expect(subPageFallback("/c/22222222-2222-2222-2222-222222222223")).toBe("/app");
  });
});

describe("ownsHeader", () => {
  it("lets Mastery, Browse, Settings and the add-terms pages draw their own header", () => {
    for (const path of ["/app/mastery", "/app/browse", "/app/settings", "/app/import/paste"]) {
      expect(ownsHeader(path)).toBe(true);
    }
    expect(ownsHeader("/app/me")).toBe(false);
  });
});

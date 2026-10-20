import { describe, expect, it } from "vitest";
import {
  parseQuizSetupCookie,
  questionCountFor,
  quizSetupToSave,
  resolveInitialQuizSetup,
} from "./setup-preference";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

function cookie(value: unknown): string {
  return encodeURIComponent(JSON.stringify(value));
}

describe("parseQuizSetupCookie", () => {
  it("reads a full setup", () => {
    expect(parseQuizSetupCookie(cookie({ style: "ai", count: 12, collectionId: A }))).toEqual({
      style: "ai",
      count: 12,
      collectionId: A,
    });
  });

  it("ignores missing, malformed or foreign values", () => {
    expect(parseQuizSetupCookie(undefined)).toBeNull();
    expect(parseQuizSetupCookie("%E0%A4%A")).toBeNull();
    expect(parseQuizSetupCookie("not json")).toBeNull();
    expect(parseQuizSetupCookie(cookie({ style: "hard" }))).toBeNull();
  });

  it("drops out-of-range counts and bad collection ids but keeps the style", () => {
    expect(parseQuizSetupCookie(cookie({ style: "simple", count: 0, collectionId: "x" }))).toEqual({
      style: "simple",
    });
    expect(parseQuizSetupCookie(cookie({ style: "simple", count: 31 }))).toEqual({
      style: "simple",
    });
    expect(parseQuizSetupCookie(cookie({ style: "simple", count: 2.5 }))).toEqual({
      style: "simple",
    });
  });
});

describe("resolveInitialQuizSetup", () => {
  it("defaults to simple, the first active collection, and no explicit count", () => {
    expect(
      resolveInitialQuizSetup({
        saved: null,
        collectionParam: undefined,
        currentId: null,
        activeIds: [A],
        aiAvailable: true,
      }),
    ).toEqual({
      style: "simple",
      collectionId: A,
      count: null,
      aiFellBack: false,
    });
  });

  it("falls back to simple, and says so, when AI isn't available", () => {
    const setup = resolveInitialQuizSetup({
      saved: { style: "ai" },
      collectionParam: undefined,
      currentId: null,
      activeIds: [A],
      aiAvailable: false,
    });
    expect(setup.style).toBe("simple");
    expect(setup.aiFellBack).toBe(true);
  });

  it("stays on AI when it is available", () => {
    const setup = resolveInitialQuizSetup({
      saved: { style: "ai" },
      collectionParam: undefined,
      currentId: null,
      activeIds: [A],
      aiAvailable: true,
    });
    expect(setup).toMatchObject({ style: "ai", aiFellBack: false });
  });

  it("uses the remembered collection only while it's active", () => {
    const base = {
      saved: { style: "simple" as const, collectionId: A },
      collectionParam: undefined,
      currentId: null,
    };
    expect(
      resolveInitialQuizSetup({
        ...base,
        activeIds: [A, B],
        aiAvailable: false,
      }).collectionId,
    ).toBe(A);
    expect(
      resolveInitialQuizSetup({ ...base, activeIds: [B], aiAvailable: false }).collectionId,
    ).toBe(B);
  });

  it("lets the app cookie win over the remembered collection", () => {
    expect(
      resolveInitialQuizSetup({
        saved: { style: "simple", collectionId: A },
        collectionParam: undefined,
        currentId: B,
        activeIds: [A, B],
        aiAvailable: false,
      }).collectionId,
    ).toBe(B);
  });

  it("lets a valid link win over the app cookie", () => {
    expect(
      resolveInitialQuizSetup({
        saved: null,
        collectionParam: B,
        currentId: A,
        activeIds: [A, B],
        aiAvailable: false,
      }).collectionId,
    ).toBe(B);
  });

  it("ignores a link to a paused collection", () => {
    expect(
      resolveInitialQuizSetup({
        saved: null,
        collectionParam: B,
        currentId: null,
        activeIds: [A],
        aiAvailable: false,
      }).collectionId,
    ).toBe(A);
  });

  it("skips an old remembered 'all'", () => {
    expect(
      resolveInitialQuizSetup({
        saved: { style: "simple", collectionId: "all" },
        collectionParam: undefined,
        currentId: null,
        activeIds: [A],
        aiAvailable: false,
      }).collectionId,
    ).toBe(A);
  });
});

describe("questionCountFor", () => {
  it("defaults to 10, capped to what's available", () => {
    expect(questionCountFor(null, 30)).toBe(10);
    expect(questionCountFor(null, 4)).toBe(4);
  });

  it("caps an explicit pick instead of resetting it", () => {
    expect(questionCountFor(20, 30)).toBe(20);
    expect(questionCountFor(20, 6)).toBe(6);
  });

  it("never goes below 1", () => {
    expect(questionCountFor(null, 0)).toBe(1);
  });
});

describe("quizSetupToSave", () => {
  it("remembers the style and an explicit count, not a collection", () => {
    expect(quizSetupToSave({ style: "ai", preferredCount: 5 })).toEqual({
      style: "ai",
      count: 5,
    });
  });

  it("omits the count until one is picked", () => {
    expect(quizSetupToSave({ style: "simple", preferredCount: null })).toEqual({
      style: "simple",
    });
  });
});

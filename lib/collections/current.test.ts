import { describe, expect, it } from "vitest";
import {
  parseCurrentCollectionId,
  pickLibraryCollectionId,
  resolveAppCollection,
  speculativeAppCollection,
} from "./current";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

const collections = [
  { id: "paused", isActiveForReview: false },
  { id: "active", isActiveForReview: true },
  { id: "other", isActiveForReview: true },
];

describe("pickLibraryCollectionId", () => {
  it("prefers the requested collection, then the last viewed one", () => {
    expect(
      pickLibraryCollectionId(collections, {
        requestedCollectionId: "other",
        lastCollectionId: "paused",
      }),
    ).toBe("other");
    expect(pickLibraryCollectionId(collections, { lastCollectionId: "paused" })).toBe("paused");
  });

  it("ignores ids the user doesn't have and falls back to the first active", () => {
    expect(
      pickLibraryCollectionId(collections, {
        requestedCollectionId: "gone",
        lastCollectionId: "gone",
      }),
    ).toBe("active");
  });

  it("uses the first collection when none is active, and nothing when there are none", () => {
    expect(pickLibraryCollectionId([{ id: "a", isActiveForReview: false }], {})).toBe("a");
    expect(pickLibraryCollectionId([], {})).toBeUndefined();
  });
});

describe("parseCurrentCollectionId", () => {
  it("accepts a collection id and skips all", () => {
    expect(parseCurrentCollectionId(A)).toBe(A);
    expect(parseCurrentCollectionId(encodeURIComponent(A))).toBe(A);
    expect(parseCurrentCollectionId("all")).toBeNull();
    expect(parseCurrentCollectionId(undefined)).toBeNull();
    expect(parseCurrentCollectionId("%E0%A4%A")).toBeNull();
  });
});

describe("speculativeAppCollection", () => {
  it("lets an explicit all or id win, then the app cookie, then a real memory", () => {
    expect(speculativeAppCollection("all", A, B)).toBe("all");
    expect(speculativeAppCollection(B, A, A)).toBe(B);
    expect(speculativeAppCollection(undefined, A, B)).toBe(A);
    expect(speculativeAppCollection(undefined, null, B)).toBe(B);
    expect(speculativeAppCollection(undefined, null, "all")).toBe("all");
  });
});

describe("resolveAppCollection", () => {
  it("lets a real link win over the app cookie and the page memory", () => {
    expect(
      resolveAppCollection({
        collectionParam: B,
        currentId: A,
        rememberedId: A,
        activeIds: [A, B],
      }),
    ).toBe(B);
  });

  it("treats an explicit all as this visit only", () => {
    expect(
      resolveAppCollection({
        collectionParam: "all",
        currentId: A,
        rememberedId: B,
        activeIds: [A, B],
      }),
    ).toBe("all");
  });

  it("uses the app cookie ahead of the page's own collection", () => {
    expect(
      resolveAppCollection({
        collectionParam: undefined,
        currentId: B,
        rememberedId: A,
        activeIds: [A, B],
      }),
    ).toBe(B);
  });

  it("skips a stored all and a paused app cookie, then uses a real memory", () => {
    expect(
      resolveAppCollection({
        collectionParam: undefined,
        currentId: null,
        rememberedId: "all",
        activeIds: [A],
      }),
    ).toBe(A);
    expect(
      resolveAppCollection({
        collectionParam: "gone",
        currentId: "gone",
        rememberedId: B,
        activeIds: [A, B],
      }),
    ).toBe(B);
  });

  it("falls back to the first active collection", () => {
    expect(
      resolveAppCollection({
        collectionParam: undefined,
        currentId: null,
        rememberedId: null,
        activeIds: [A, B],
      }),
    ).toBe(A);
  });
});

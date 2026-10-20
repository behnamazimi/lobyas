import { describe, expect, it } from "vitest";
import { createCollectionPreference } from "./collection-preference";

const A = "11111111-1111-4111-8111-111111111111";

describe("createCollectionPreference().parse", () => {
  const pref = createCollectionPreference("jg-test");

  it("accepts all or a collection id", () => {
    expect(pref.parse("all")).toBe("all");
    expect(pref.parse(encodeURIComponent(A))).toBe(A);
  });

  it("ignores empty, malformed or foreign values", () => {
    expect(pref.parse(undefined)).toBeNull();
    expect(pref.parse("%E0%A4%A")).toBeNull();
    expect(pref.parse("drop table")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { collectionTitleClass, formatCount, termTitleClass, termWeight } from "./text";

describe("termWeight", () => {
  it("counts a CJK character as two letters", () => {
    expect(termWeight("abc")).toBe(3);
    expect(termWeight("日本語")).toBe(6);
    expect(termWeight("よろしくお願いします")).toBe(20);
  });

  it("reads an astral character as one wide letter, not two code units", () => {
    expect(termWeight("a😀")).toBe(3);
  });
});

describe("termTitleClass", () => {
  it("shrinks the front title as the term grows", () => {
    expect(termTitleClass("Blocker")).toBe("text-[46px]");
    expect(termTitleClass("Scope creep and more")).toBe("text-4xl");
    expect(termTitleClass("Conflict-free replicated data type (CRDT)")).toBe("text-[26px]");
  });

  it("sizes a Japanese phrase by its doubled width", () => {
    expect(termTitleClass("よろしくお願いします")).toBe("text-4xl");
    expect(termTitleClass("よろしくお願いします。")).toBe("text-[30px]");
  });

  it("uses two sizes on the back", () => {
    expect(termTitleClass("Blocker", "back")).toBe("text-[26px]");
    expect(termTitleClass("Conflict-free replicated data type (CRDT)", "back")).toBe("text-[22px]");
  });
});

describe("collectionTitleClass", () => {
  it("counts letters, not bytes", () => {
    expect(collectionTitleClass("Standup")).toBe("text-[34px]");
    expect(collectionTitleClass("Distributed Systems Fundamentals")).toBe("text-2xl");
  });
});

describe("formatCount", () => {
  it("groups thousands", () => {
    expect(formatCount(1024)).toBe("1,024");
    expect(formatCount(0)).toBe("0");
  });
});

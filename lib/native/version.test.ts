import { describe, expect, it } from "vitest";
import { compareVersions, updateState } from "./version";

const POLICY = { recommended: "1.2.0", required: "1.0.5" };

describe("compareVersions", () => {
  it("compares each part as a number", () => {
    expect(compareVersions("1.10.0", "1.9.0")).toBe(1);
  });

  it("treats equal versions as equal", () => {
    expect(compareVersions("2.0.0", "2.0.0")).toBe(0);
  });
});

describe("updateState", () => {
  it("requires an update below the required version", () => {
    expect(updateState("1.0.4", POLICY)).toBe("required");
  });

  it("recommends an update between the two versions", () => {
    expect(updateState("1.0.5", POLICY)).toBe("recommended");
  });

  it("accepts the recommended version", () => {
    expect(updateState("1.2.0", POLICY)).toBe("ok");
  });

  it("counts an app with no version as older than any floor", () => {
    expect(updateState(null, POLICY)).toBe("required");
  });

  it("never prompts while both floors are 0.0.0", () => {
    expect(updateState(null, { recommended: "0.0.0", required: "0.0.0" })).toBe("ok");
  });
});

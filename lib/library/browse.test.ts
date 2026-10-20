import { describe, expect, it } from "vitest";
import { browseSearchOr, escapeIlike, parseBrowseGroup } from "./browse";
import { browseLibraryIds, hidesOwnedRows } from "./browse-owned";

describe("escapeIlike", () => {
  it("escapes wildcard and backslash characters", () => {
    expect(escapeIlike("100%_done\\now")).toBe("100\\%\\_done\\\\now");
  });
});

describe("browseSearchOr", () => {
  it("returns null for blank queries", () => {
    expect(browseSearchOr("")).toBeNull();
    expect(browseSearchOr("   ")).toBeNull();
  });

  it("builds a quoted name-or-description ilike filter", () => {
    expect(browseSearchOr("machine")).toBe('name.ilike."%machine%",description.ilike."%machine%"');
  });

  it("escapes wildcards inside the quoted pattern", () => {
    expect(browseSearchOr("100%")).toBe('name.ilike."%100\\%%",description.ilike."%100\\%%"');
  });
});

describe("parseBrowseGroup", () => {
  it("accepts community", () => {
    expect(parseBrowseGroup("community")).toBe("community");
  });

  it("falls back to builtin for missing or unknown values", () => {
    expect(parseBrowseGroup(undefined)).toBe("builtin");
    expect(parseBrowseGroup("builtin")).toBe("builtin");
    expect(parseBrowseGroup("nope")).toBe("builtin");
  });
});

describe("owned built-ins", () => {
  it("lists built-ins the viewer owns and treats them as in the library", () => {
    expect(hidesOwnedRows("builtin")).toBe(false);
    expect(browseLibraryIds(["added"], ["mine"], "builtin")).toEqual(["added", "mine"]);
  });

  it("hides community collections the viewer owns", () => {
    expect(hidesOwnedRows("community")).toBe(true);
    expect(browseLibraryIds(["added"], ["mine"], "community")).toEqual(["added"]);
  });
});

import { describe, expect, it } from "vitest";
import { readAsLine } from "./read-as";
import type { ParsedList } from "./parse/types";

const list = (patch: Partial<ParsedList>): ParsedList => ({
  format: "lines",
  rows: [],
  heading: null,
  headingDetected: false,
  separator: null,
  roles: [],
  ...patch,
});

describe("readAsLine", () => {
  it("names the separator of a line list", () => {
    expect(readAsLine(list({ separator: "dash" }))).toBe("term, then a definition after a dash.");
  });

  it("describes a list with no separator as one term per line", () => {
    expect(readAsLine(list({}))).toBe("one term per line.");
  });

  it("describes tables and JSON", () => {
    expect(readAsLine(list({ format: "csv" }))).toBe("a table, one term per row.");
    expect(readAsLine(null)).toBe("a JSON file.");
  });
});

import { describe, expect, it } from "vitest";
import { codeHighlight, codeHighlights } from "./code-highlight";

describe("code highlight references", () => {
  it.each([
    ["[highlight:L3]", { from: 3, to: 3 }],
    ["[highlight:L3-4]", { from: 3, to: 4 }],
    ["[highlight:L3-L4]", { from: 3, to: 4 }],
  ])("parses %s", (value, expected) => {
    expect(codeHighlight(value)).toEqual(expected);
  });

  it.each(["highlight:L3", "[highlight:L0]", "[highlight:L4-2]"])("rejects %s", (value) => {
    expect(codeHighlight(value)).toBeNull();
  });

  it("finds references embedded in prose", () => {
    expect(codeHighlights("Start at [highlight:L2], then compare [highlight:L5-7].")).toEqual([
      { from: 2, to: 2 },
      { from: 5, to: 7 },
    ]);
  });
});

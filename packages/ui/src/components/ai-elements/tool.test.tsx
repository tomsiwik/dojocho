import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ToolInput } from "./tool";

describe("ToolInput", () => {
  it("ignores an omitted ACP input instead of passing undefined to CodeBlock", () => {
    expect(renderToStaticMarkup(<ToolInput input={undefined} />)).toBe("");
  });
});

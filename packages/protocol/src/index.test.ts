import { describe, expect, it } from "vitest";
import { lessonCapabilities, uiCapabilities } from ".";

describe("lesson capability registry", () => {
  it("contains only production lesson tools", () => {
    expect(Object.values(lessonCapabilities).map(({ tool }) => tool)).toEqual([
      "dojo_context",
      "dojo_lesson_verify",
      "dojo_lesson_complete",
    ]);
  });

  it("names UI capabilities under the dojo namespace", () => {
    expect(uiCapabilities.ask).toEqual({
      method: "dojo.ui.ask",
      tool: "dojo_ui_ask",
      description: expect.any(String),
    });
    expect(uiCapabilities.show).toEqual({
      method: "dojo.ui.show",
      tool: "dojo_ui_show",
      description: expect.any(String),
    });
  });
});

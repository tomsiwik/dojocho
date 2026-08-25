import { describe, expect, it } from "vitest";
import { formatThinkingSteps } from "./thinking-steps-format";

describe("formatThinkingSteps", () => {
  it("uses a complete bold ACP thought as the step label", () => {
    expect(formatThinkingSteps("\n\n**Preparing whitespace-class lesson fragment**")).toEqual([
      { label: "Preparing whitespace-class lesson fragment" },
    ]);
  });

  it("does not infer multiple steps from arbitrary reasoning markdown", () => {
    expect(formatThinkingSteps("\n\n**Preparing whitespace-class lesson fragment**\n\n**Reviewing skill activation protocol**")).toEqual([
      { content: "\n\n**Preparing whitespace-class lesson fragment**\n\n**Reviewing skill activation protocol**" },
    ]);
  });

  it("preserves ordinary thought content without inventing a label", () => {
    expect(formatThinkingSteps("**Running dojo_lesson_verify**\nComparing the latest failures with the previous attempt.")).toEqual([
      { content: "**Running dojo_lesson_verify**\nComparing the latest failures with the previous attempt." },
    ]);
  });
});

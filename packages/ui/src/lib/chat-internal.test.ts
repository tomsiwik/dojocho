import { describe, expect, it } from "vitest";
import { chatAcceptsInput, isInternalLessonMessage } from "./chat-internal";

describe("internal lesson messages", () => {
  it.each([
    "[dojo:begin-lesson]",
    "[dojo:check-observation]",
    "[dojofoo://lessons/001-normalize-handle/introduction]",
    "[dojofoo://lessons/001-normalize-handle/checks/latest]Use the completion tool now.",
    "[dojofoo://courses/starter-kata/lessons/002-validate-registration/context][dojofoo://lessons/002-validate-registration/introduction]",
  ])("hides %s from the learner transcript", (message) => {
    expect(isInternalLessonMessage(message)).toBe(true);
  });

  it("keeps ordinary learner messages visible", () => {
    expect(isInternalLessonMessage("What should I try next?")).toBe(false);
  });
});

describe("chat input recovery", () => {
  it.each(["ready", "error"] as const)("accepts input in %s state", (status) => {
    expect(chatAcceptsInput(status)).toBe(true);
  });

  it.each(["submitted", "streaming"] as const)("blocks input in %s state", (status) => {
    expect(chatAcceptsInput(status)).toBe(false);
  });
});

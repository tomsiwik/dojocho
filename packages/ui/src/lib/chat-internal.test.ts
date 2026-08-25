import { describe, expect, it } from "vitest";
import type { UIMessage } from "@tanstack/ai-client";
import { chatAcceptsInput, isInternalLessonMessage, lessonNeedsIntroduction } from "./chat-internal";

function message(role: "assistant" | "user", content: string): UIMessage {
  return { id: crypto.randomUUID(), role, parts: [{ type: "text", content }] };
}

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

describe("lesson introduction", () => {
  it("introduces a lesson whose harness session exists without a transcript", () => {
    expect(lessonNeedsIntroduction([])).toBe(true);
  });

  it("ignores internal bootstrap references when deciding whether to introduce", () => {
    expect(lessonNeedsIntroduction([
      message("user", "[dojo:begin-lesson]"),
      message("user", "[dojofoo://lessons/001-first/introduction]"),
    ])).toBe(true);
  });

  it.each([
    message("assistant", "Welcome to the lesson."),
    message("user", "Can we begin?"),
  ])("does not interrupt an existing conversation", (existing) => {
    expect(lessonNeedsIntroduction([existing])).toBe(false);
  });
});

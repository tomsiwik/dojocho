import type { ToolCallPart } from "@tanstack/ai-client";
import { describe, expect, it } from "vitest";
import { isAgentQuestion, parseAgentQuestions } from "./agent-question";

const choice: ToolCallPart = {
  type: "tool-call",
  id: "choice",
  name: "elicitation",
  arguments: "{}",
  input: { question: "What next?", options: [{ id: "review", label: "Review" }] },
  state: "input-complete",
};

describe("agent questions", () => {
  it("recognizes and parses a question tool", () => {
    expect(isAgentQuestion(choice)).toBe(true);
    expect(parseAgentQuestions(choice.input)).toEqual([expect.objectContaining({ title: "What next?" })]);
  });

  it("does not mistake an ordinary tool for a question", () => {
    expect(isAgentQuestion({ ...choice, name: "check_lesson" })).toBe(false);
  });
});

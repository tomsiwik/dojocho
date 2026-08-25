import { describe, expect, it } from "vitest";
import { SESSION_COMPLETION_TIMEOUT_CASSETTE } from "./session-completion-timeout-cassette";

describe("captured lesson completion timeout", () => {
  it("preserves the failed completion call between the two reasoning passages", () => {
    const callbacks = SESSION_COMPLETION_TIMEOUT_CASSETTE.map(({ callback }) => callback);
    const result = SESSION_COMPLETION_TIMEOUT_CASSETTE.find(({ callback }) => callback === "onToolCallResultEvent");
    const toolResultIndex = callbacks.indexOf("onToolCallResultEvent");
    const reasoningStarts = callbacks.flatMap((callback, index) =>
      callback === "onReasoningMessageStartEvent" ? [index] : []
    );

    expect(reasoningStarts).toHaveLength(2);
    expect(toolResultIndex).toBeGreaterThan(reasoningStarts[0]!);
    expect(toolResultIndex).toBeLessThan(reasoningStarts[1]!);
    expect(result?.event).toMatchObject({
      toolCallId: "complete-lesson",
      content: "MCP error -32001: Request timed out",
    });
  });
});

import { describe, expect, it } from "vitest";
import { streamAcpAsAgUi } from "./agui-stream";

describe("ACP to AG-UI stream", () => {
  it("emits standard run, reasoning, text, and tool lifecycles", async () => {
    const events = [];
    for await (const event of streamAcpAsAgUi({
      runId: "run-1",
      threadId: "thread-1",
      execute: async (write) => {
        write({ type: "reasoning-start", id: "reasoning-1" });
        write({ type: "reasoning-delta", id: "reasoning-1", delta: "Inspecting" });
        write({ type: "reasoning-end", id: "reasoning-1" });
        write({ type: "tool-input-start", toolCallId: "tool-1", toolName: "check_lesson", dynamic: true });
        write({ type: "tool-input-available", toolCallId: "tool-1", toolName: "check_lesson", input: {}, dynamic: true });
        write({ type: "tool-output-available", toolCallId: "tool-1", output: { passed: 1 }, dynamic: true });
        write({ type: "text-start", id: "message-1" });
        write({ type: "text-delta", id: "message-1", delta: "Done" });
        write({ type: "text-end", id: "message-1" });
      },
    })) events.push(event);

    expect(events.map(({ type }) => type)).toEqual([
      "RUN_STARTED",
      "REASONING_START",
      "REASONING_MESSAGE_START",
      "REASONING_MESSAGE_CONTENT",
      "REASONING_MESSAGE_END",
      "REASONING_END",
      "TOOL_CALL_START",
      "TOOL_CALL_ARGS",
      "TOOL_CALL_END",
      "TOOL_CALL_RESULT",
      "TEXT_MESSAGE_START",
      "TEXT_MESSAGE_CONTENT",
      "TEXT_MESSAGE_END",
      "RUN_FINISHED",
    ]);
    expect(events[0]).toMatchObject({ runId: "run-1", threadId: "thread-1" });
    expect(events.at(-1)).toMatchObject({ runId: "run-1", threadId: "thread-1" });
  });

  it("converts harness failures into RUN_ERROR", async () => {
    const events = [];
    for await (const event of streamAcpAsAgUi({
      runId: "run-error",
      threadId: "thread-1",
      execute: async () => { throw new Error("provider unavailable"); },
    })) events.push(event);
    expect(events.map(({ type }) => type)).toEqual(["RUN_STARTED", "RUN_ERROR"]);
    expect(events[1]).toMatchObject({ message: "provider unavailable" });
  });
});

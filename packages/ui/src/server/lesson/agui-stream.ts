import { EventType, type StreamChunk } from "@tanstack/ai";
import type { AcpStreamPart } from "./codex-client";

type StreamRun = (onPart: (part: AcpStreamPart) => void) => Promise<void>;

function jsonContent(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function acpPartEvents(part: AcpStreamPart): StreamChunk[] {
  switch (part.type) {
    case "text-start":
      return [{ type: EventType.TEXT_MESSAGE_START, messageId: part.id, role: "assistant" }];
    case "text-delta":
      return [{ type: EventType.TEXT_MESSAGE_CONTENT, messageId: part.id, delta: part.delta }];
    case "text-end":
      return [{ type: EventType.TEXT_MESSAGE_END, messageId: part.id }];
    case "reasoning-start":
      return [
        { type: EventType.REASONING_START, messageId: part.id },
        { type: EventType.REASONING_MESSAGE_START, messageId: part.id, role: "reasoning" },
      ];
    case "reasoning-delta":
      return [{ type: EventType.REASONING_MESSAGE_CONTENT, messageId: part.id, delta: part.delta }];
    case "reasoning-end":
      return [
        { type: EventType.REASONING_MESSAGE_END, messageId: part.id },
        { type: EventType.REASONING_END, messageId: part.id },
      ];
    case "tool-input-start":
      return [{
        type: EventType.TOOL_CALL_START,
        toolCallId: part.toolCallId,
        toolCallName: part.toolName,
        toolName: part.toolName,
      }];
    case "tool-input-available":
      return [
        { type: EventType.TOOL_CALL_ARGS, toolCallId: part.toolCallId, delta: jsonContent(part.input) },
        {
          type: EventType.TOOL_CALL_END,
          toolCallId: part.toolCallId,
          toolCallName: part.toolName,
          toolName: part.toolName,
          input: part.input,
        },
      ];
    case "tool-output-available":
      return [{
        type: EventType.TOOL_CALL_RESULT,
        messageId: `${part.toolCallId}:result`,
        toolCallId: part.toolCallId,
        content: jsonContent(part.output),
        role: "tool",
        state: "output-available",
      }];
  }
}

export async function* streamAcpAsAgUi({
  execute,
  reveal = "immediate",
  runId,
  threadId,
}: {
  execute: StreamRun;
  reveal?: "immediate" | "first-assistant-text";
  runId: string;
  threadId: string;
}): AsyncGenerator<StreamChunk> {
  const queued: StreamChunk[] = [{ type: EventType.RUN_STARTED, runId, threadId }];
  let revealed = reveal === "immediate";
  let settled = false;
  let wake: (() => void) | undefined;

  const notify = () => {
    wake?.();
    wake = undefined;
  };
  void execute((part) => {
    if (!revealed) {
      if (part.type !== "text-start") return;
      revealed = true;
    }
    queued.push(...acpPartEvents(part));
    notify();
  }).then(
    () => {
      queued.push({ type: EventType.RUN_FINISHED, runId, threadId, finishReason: "stop" });
      settled = true;
      notify();
    },
    (cause) => {
      queued.push({
        type: EventType.RUN_ERROR,
        message: cause instanceof Error ? cause.message : String(cause),
        code: "DOJOFOO_AGENT_ERROR",
      });
      settled = true;
      notify();
    },
  );

  while (!settled || queued.length > 0) {
    const event = queued.shift();
    if (event) {
      yield event;
      continue;
    }
    await new Promise<void>((resolve) => { wake = resolve; });
  }
}

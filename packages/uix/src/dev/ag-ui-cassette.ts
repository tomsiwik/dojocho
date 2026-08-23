import type { AbstractAgent, AgentSubscriber } from "@ag-ui/client";

type SubscriberEvent = keyof Pick<
  AgentSubscriber,
  | "onRunStartedEvent"
  | "onReasoningMessageStartEvent"
  | "onReasoningMessageContentEvent"
  | "onReasoningMessageEndEvent"
  | "onToolCallStartEvent"
  | "onToolCallArgsEvent"
  | "onToolCallEndEvent"
  | "onToolCallResultEvent"
  | "onTextMessageStartEvent"
  | "onTextMessageContentEvent"
  | "onTextMessageEndEvent"
  | "onRunFinishedEvent"
>;

export interface CassetteEvent {
  callback: SubscriberEvent;
  event: Record<string, unknown>;
  wait: number;
}

export const LESSON_CASSETTE: readonly CassetteEvent[] = [
  {
    callback: "onRunStartedEvent",
    event: { type: "RUN_STARTED", runId: "storybook-run" },
    wait: 200,
  },
  {
    callback: "onReasoningMessageStartEvent",
    event: { type: "REASONING_MESSAGE_START", messageId: "reasoning-1" },
    wait: 350,
  },
  ..."I am comparing the learner's latest edit with the lesson goal before deciding whether a nudge would help."
    .split(" ")
    .map((word) => ({
      callback: "onReasoningMessageContentEvent" as const,
      event: {
        type: "REASONING_MESSAGE_CONTENT",
        messageId: "reasoning-1",
        delta: `${word} `,
      },
      wait: 85,
    })),
  {
    callback: "onReasoningMessageEndEvent",
    event: { type: "REASONING_MESSAGE_END", messageId: "reasoning-1" },
    wait: 250,
  },
  {
    callback: "onToolCallStartEvent",
    event: {
      type: "TOOL_CALL_START",
      toolCallId: "check-1",
      toolCallName: "lesson_check",
    },
    wait: 350,
  },
  {
    callback: "onToolCallArgsEvent",
    event: {
      type: "TOOL_CALL_ARGS",
      toolCallId: "check-1",
      delta: '{"lessonId":"001-normalize-handle"}',
    },
    wait: 700,
  },
  {
    callback: "onToolCallEndEvent",
    event: { type: "TOOL_CALL_END", toolCallId: "check-1" },
    wait: 500,
  },
  {
    callback: "onToolCallResultEvent",
    event: {
      type: "TOOL_CALL_RESULT",
      toolCallId: "check-1",
      content: '{"total":4,"passed":3,"failed":1}',
    },
    wait: 300,
  },
  {
    callback: "onTextMessageStartEvent",
    event: { type: "TEXT_MESSAGE_START", messageId: "assistant-1" },
    wait: 250,
  },
  ..."Three of four checks pass. The remaining failure is about treating adjacent whitespace as one run. What behavior do you notice for a tab followed by two spaces?"
    .split(" ")
    .map((word) => ({
      callback: "onTextMessageContentEvent" as const,
      event: {
        type: "TEXT_MESSAGE_CONTENT",
        messageId: "assistant-1",
        delta: `${word} `,
      },
      wait: 90,
    })),
  {
    callback: "onTextMessageEndEvent",
    event: { type: "TEXT_MESSAGE_END", messageId: "assistant-1" },
    wait: 150,
  },
  {
    callback: "onRunFinishedEvent",
    event: { type: "RUN_FINISHED", runId: "storybook-run" },
    wait: 0,
  },
];

const delay = (duration: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, duration));

export function createCassetteAgent(
  cassette: readonly CassetteEvent[],
  speed = 1,
): AbstractAgent {
  let aborted = false;
  return {
    abortRun: () => {
      aborted = true;
    },
    runAgent: async (_input: unknown, subscriber: AgentSubscriber) => {
      aborted = false;
      for (const frame of cassette) {
        await delay(frame.wait / speed);
        if (aborted) break;
        const callback = subscriber[frame.callback] as
          | ((payload: { event: unknown }) => unknown)
          | undefined;
        await callback?.({ event: frame.event });
      }
      subscriber.onRunFinalized?.({} as never);
      return {} as never;
    },
  } as unknown as AbstractAgent;
}

import type { CassetteEvent } from "./ag-ui-cassette";

const words = (
  callback: "onReasoningMessageContentEvent" | "onTextMessageContentEvent",
  messageId: string,
  text: string,
  wait = 45,
): CassetteEvent[] => text.split(" ").map((word) => ({
  callback,
  event: {
    type: callback === "onReasoningMessageContentEvent"
      ? "REASONING_MESSAGE_CONTENT"
      : "TEXT_MESSAGE_CONTENT",
    messageId,
    delta: `${word} `,
  },
  wait,
}));

/**
 * Captured from session ses_fd04720b7ffeVJ1Al91xqi1GDe.
 * Local paths and the verbose hidden prompt were omitted; the event ordering,
 * learner-visible prose, tool name, arguments, and failure are unchanged.
 */
export const SESSION_COMPLETION_TIMEOUT_CASSETTE: readonly CassetteEvent[] = [
  { callback: "onRunStartedEvent", event: { type: "RUN_STARTED", runId: "completion-timeout" }, wait: 120 },
  { callback: "onReasoningMessageStartEvent", event: { type: "REASONING_MESSAGE_START", messageId: "completion-reasoning" }, wait: 160 },
  ...words(
    "onReasoningMessageContentEvent",
    "completion-reasoning",
    "All four tests pass. I should share the authored completion insight, call dojo_lesson_complete once, and wait for the learner.",
  ),
  { callback: "onReasoningMessageEndEvent", event: { type: "REASONING_MESSAGE_END", messageId: "completion-reasoning" }, wait: 100 },
  { callback: "onTextMessageStartEvent", event: { type: "TEXT_MESSAGE_START", messageId: "completion-message" }, wait: 100 },
  ...words(
    "onTextMessageContentEvent",
    "completion-message",
    "All four green — nicely done. You have built a pure normalization boundary. Everything downstream can consume one stable representation instead of interpreting messy input again. The next kata passes that canonical handle into an explicit success-or-failure result.",
  ),
  { callback: "onTextMessageEndEvent", event: { type: "TEXT_MESSAGE_END", messageId: "completion-message" }, wait: 120 },
  {
    callback: "onToolCallStartEvent",
    event: { type: "TOOL_CALL_START", toolCallId: "complete-lesson", toolCallName: "dojofoo_dojo_lesson_complete" },
    wait: 180,
  },
  {
    callback: "onToolCallArgsEvent",
    event: { type: "TOOL_CALL_ARGS", toolCallId: "complete-lesson", delta: "{}" },
    wait: 500,
  },
  { callback: "onToolCallEndEvent", event: { type: "TOOL_CALL_END", toolCallId: "complete-lesson" }, wait: 220 },
  {
    callback: "onToolCallResultEvent",
    event: {
      type: "TOOL_CALL_RESULT",
      messageId: "complete-lesson-result",
      toolCallId: "complete-lesson",
      content: "MCP error -32001: Request timed out",
      role: "tool",
    },
    wait: 180,
  },
  { callback: "onReasoningMessageStartEvent", event: { type: "REASONING_MESSAGE_START", messageId: "recovery-reasoning" }, wait: 120 },
  ...words(
    "onReasoningMessageContentEvent",
    "recovery-reasoning",
    "The completion prompt timed out. I should report the failure briefly, but the lesson policy still asks me to offer review, moving on, or pausing.",
  ),
  { callback: "onReasoningMessageEndEvent", event: { type: "REASONING_MESSAGE_END", messageId: "recovery-reasoning" }, wait: 100 },
  { callback: "onTextMessageStartEvent", event: { type: "TEXT_MESSAGE_START", messageId: "fallback-message" }, wait: 100 },
  ...words(
    "onTextMessageContentEvent",
    "fallback-message",
    "Hmm — the wrap-up prompt timed out on my side, so nothing appeared for you. No harm done. Your call: want to review your solution together for a moment, head into the next kata, or pick this up later?",
  ),
  { callback: "onTextMessageEndEvent", event: { type: "TEXT_MESSAGE_END", messageId: "fallback-message" }, wait: 100 },
  { callback: "onRunFinishedEvent", event: { type: "RUN_FINISHED", runId: "completion-timeout" }, wait: 0 },
];

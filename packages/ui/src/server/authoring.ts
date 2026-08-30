import {
  createAuthoringRoutes,
  type AuthoringRouteDependencies,
} from "@dojofoo/authoring/server";
import { toServerSentEventsResponse } from "@tanstack/ai";
import type { HarnessKind } from "./harness/adapter";
import { dojofooHarness } from "./harness/registry";
import { streamAcpAsAgUi } from "./lesson/agui-stream";
import { acpClient } from "./lesson/codex-client";
import { resolveRequestWorkspace } from "./control/workspace";

const agent: AuthoringRouteDependencies["agent"] = {
  currentHarness: dojofooHarness,
  start: ({ root, runtimeKey, harness, instructions }) => acpClient.startThread({
    root,
    runtimeKey,
    harness: harness as HarnessKind,
    developerInstructions: instructions,
    toolProfile: "authoring",
  }),
  resume: (sessionId, { root, runtimeKey, harness, instructions }) =>
    acpClient.resumeThread(sessionId, {
      root,
      runtimeKey,
      harness: harness as HarnessKind,
      developerInstructions: instructions,
      toolProfile: "authoring",
    }),
  history: (sessionId) => acpClient.history(sessionId),
  send: (sessionId, message, onPart, options) =>
    acpClient.send(sessionId, message, onPart, options),
  answer: (sessionId, answers) => acpClient.answerUserInput(sessionId, answers),
};

export const authoringRoutes = createAuthoringRoutes({
  agent,
  resolveWorkspace: resolveRequestWorkspace,
  stream: ({ execute, runId, threadId }) => toServerSentEventsResponse(
    streamAcpAsAgUi({ execute, runId, threadId })
  ),
});

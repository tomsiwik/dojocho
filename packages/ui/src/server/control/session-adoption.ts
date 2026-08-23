import {
  getSession,
  setSessionLifecycle,
  type LocalSession,
  type LocalStateOptions,
} from "@dojofoo/config/local-state";
import type { HarnessV1ResumeSessionState } from "@ai-sdk/harness";
import { acpClient, type TranscriptMessage } from "../lesson/codex-client";

export type HarnessResumeSessionState = HarnessV1ResumeSessionState;

export type SessionAdoptionResult = {
  session: LocalSession;
  lifecycleState: HarnessResumeSessionState;
  transcript: TranscriptMessage[];
};

type CodexSessionDriver = {
  resumeThread(threadId: string): Promise<void>;
  history(threadId: string): Promise<TranscriptMessage[]>;
};

export async function adoptLocalSession(
  sessionId: string,
  options: LocalStateOptions = {},
  driver: CodexSessionDriver = acpClient,
): Promise<SessionAdoptionResult> {
  const session = getSession(sessionId, options);
  if (!session) throw new SessionAdoptionError("not-found", `Unknown local session: ${sessionId}`);
  if (session.harness !== "codex") {
    throw new SessionAdoptionError(
      "unsupported-harness",
      `Session adoption is not implemented for ${session.harness} yet`,
    );
  }

  // This is the lifecycle payload consumed by @ai-sdk/harness-codex. The
  // local driver proves that the native thread is resolvable before we retain
  // the pointer; a future port-capable local sandbox provider can consume the
  // same record through HarnessAgent.createSession({ sessionId, resumeFrom }).
  const lifecycleState: HarnessResumeSessionState = {
    type: "resume-session",
    harnessId: "codex",
    specificationVersion: "harness-v1",
    data: { threadId: session.nativeId },
  };

  try {
    await driver.resumeThread(session.nativeId);
    const transcript = await driver.history(session.nativeId);
    const adopted = setSessionLifecycle(session.id, {
      ownership: "managed",
      harnessSessionId: session.id,
      lifecycleState,
    }, options);
    return { session: adopted, lifecycleState, transcript };
  } catch (cause) {
    throw new SessionAdoptionError(
      "native-session-unavailable",
      `Codex could not resume native thread ${session.nativeId}`,
      cause,
    );
  }
}

export class SessionAdoptionError extends Error {
  constructor(
    readonly code: "not-found" | "unsupported-harness" | "native-session-unavailable",
    message: string,
    options?: unknown,
  ) {
    super(message, options === undefined ? undefined : { cause: options });
    this.name = "SessionAdoptionError";
  }
}

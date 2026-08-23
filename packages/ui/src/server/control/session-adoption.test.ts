import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { listSessions, observeLocalContext } from "@dojofoo/config/local-state";
import { adoptLocalSession, SessionAdoptionError } from "./session-adoption";

const temporaryPaths: string[] = [];

afterEach(() => {
  for (const path of temporaryPaths.splice(0)) rmSync(path, { recursive: true, force: true });
});

function fixture(harness = "codex") {
  const root = mkdtempSync(join(tmpdir(), "dojofoo-adoption-workspace-"));
  const stateHome = mkdtempSync(join(tmpdir(), "dojofoo-adoption-home-"));
  temporaryPaths.push(root, stateHome);
  writeFileSync(resolve(root, ".dojorc"), JSON.stringify({
    currentDojo: "starter",
    currentKata: "001-first",
    editor: null,
    progress: { starter: { completed: [], lastActive: "001-first" } },
  }));
  const context = observeLocalContext(root, {
    stateHome,
    now: 100,
    session: { harness, nativeId: "native-thread-123", transcriptPath: "/native/session.jsonl" },
  });
  return { stateHome, sessionId: context!.sessionId! };
}

describe("local harness session adoption", () => {
  it("proves a discovered Codex thread and stores an AI SDK Harness resume pointer", async () => {
    const { stateHome, sessionId } = fixture();
    const driver = {
      resumeThread: vi.fn(async () => undefined),
      history: vi.fn(async () => [{ role: "assistant" as const, text: "Existing conversation" }]),
    };

    const result = await adoptLocalSession(sessionId, { stateHome, now: 200 }, driver);

    expect(driver.resumeThread).toHaveBeenCalledWith("native-thread-123");
    expect(result.lifecycleState).toEqual({
      type: "resume-session",
      harnessId: "codex",
      specificationVersion: "harness-v1",
      data: { threadId: "native-thread-123" },
    });
    expect(result.transcript).toEqual([{ role: "assistant", text: "Existing conversation" }]);
    expect(listSessions({ stateHome })).toEqual([
      expect.objectContaining({
        id: sessionId,
        ownership: "managed",
        harnessSessionId: sessionId,
        transcriptPath: "/native/session.jsonl",
      }),
    ]);
  });

  it("does not retain a pointer when the native runtime cannot resolve it", async () => {
    const { stateHome, sessionId } = fixture();
    const driver = {
      resumeThread: vi.fn(async () => { throw new Error("thread missing"); }),
      history: vi.fn(async () => []),
    };

    await expect(adoptLocalSession(sessionId, { stateHome, now: 200 }, driver))
      .rejects.toMatchObject({ code: "native-session-unavailable" } satisfies Partial<SessionAdoptionError>);
    expect(listSessions({ stateHome })[0]).toEqual(expect.objectContaining({ ownership: "external" }));
  });

  it("reports adapters that need their own adoption implementation", async () => {
    const { stateHome, sessionId } = fixture("claude");
    await expect(adoptLocalSession(sessionId, { stateHome }))
      .rejects.toMatchObject({ code: "unsupported-harness" } satisfies Partial<SessionAdoptionError>);
  });
});

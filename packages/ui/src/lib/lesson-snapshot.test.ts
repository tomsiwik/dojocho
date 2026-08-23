import { describe, expect, it, vi } from "vitest";
import type { LessonSnapshot } from "@/server/lesson/service";
import { applyLessonMetadata, hydrateLesson } from "./lesson-snapshot";

const snapshot = { code: "next", messages: [{ id: "stored", role: "assistant", parts: [] }] } as unknown as LessonSnapshot;

describe("lesson snapshot ownership", () => {
  it("hydrates messages exactly once for a cold lesson", () => {
    const target = { setCode: vi.fn(), setLesson: vi.fn(), setMessages: vi.fn() };
    hydrateLesson(snapshot, target);
    expect(target.setMessages).toHaveBeenCalledOnce();
    expect(target.setMessages).toHaveBeenCalledWith(snapshot.messages);
  });

  it("cannot replace a completed live stream while refreshing metadata", () => {
    const target = { setCode: vi.fn(), setLesson: vi.fn(), setMessages: vi.fn() };
    applyLessonMetadata(snapshot, target);
    expect(target.setLesson).toHaveBeenCalledWith(snapshot);
    expect(target.setMessages).not.toHaveBeenCalled();
  });
});

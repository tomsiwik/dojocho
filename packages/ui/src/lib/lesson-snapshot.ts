import type { UIMessage } from "@tanstack/ai-client";
import type { LessonSnapshot } from "@/server/lesson/service";

type MetadataTarget = {
  setCode(code: string): void;
  setLesson(lesson: LessonSnapshot): void;
};

type HydrationTarget = MetadataTarget & {
  setMessages(messages: UIMessage[]): void;
};

/** Apply durable lesson metadata without touching the live chat projection. */
export function applyLessonMetadata(snapshot: LessonSnapshot, target: MetadataTarget): void {
  target.setLesson(snapshot);
  target.setCode(snapshot.code);
}

/** Hydrate a cold page. This is the only operation allowed to replace chat messages. */
export function hydrateLesson(snapshot: LessonSnapshot, target: HydrationTarget): void {
  applyLessonMetadata(snapshot, target);
  target.setMessages(snapshot.messages);
}

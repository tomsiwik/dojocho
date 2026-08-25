import type { ChatClientState } from "@tanstack/ai-client";

const INTERNAL_DOJOFOO_REFERENCE = /^\[dojofoo:\/\/[^\]]+\]/u;

export function isInternalLessonMessage(content: string): boolean {
  return content === "[dojo:begin-lesson]"
    || content === "[dojo:check-observation]"
    || INTERNAL_DOJOFOO_REFERENCE.test(content);
}

export function chatAcceptsInput(status: ChatClientState): boolean {
  return status === "ready" || status === "error";
}

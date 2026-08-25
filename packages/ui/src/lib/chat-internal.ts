import type { ChatClientState, UIMessage } from "@tanstack/ai-client";

const INTERNAL_DOJOFOO_REFERENCE = /^\[dojofoo:\/\/[^\]]+\]/u;

export function isInternalLessonMessage(content: string): boolean {
  return content === "[dojo:begin-lesson]"
    || content === "[dojo:check-observation]"
    || INTERNAL_DOJOFOO_REFERENCE.test(content);
}

export function chatAcceptsInput(status: ChatClientState): boolean {
  return status === "ready" || status === "error";
}

export function lessonNeedsIntroduction(messages: UIMessage[]): boolean {
  return !messages.some((message) => message.parts.some((part) => (
    part.type === "text"
    && part.content.trim().length > 0
    && !isInternalLessonMessage(part.content)
  )));
}

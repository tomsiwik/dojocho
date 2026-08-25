export const lessonCapabilities = {
  context: {
    method: "dojo.context",
    tool: "dojo_context",
    description: "Retrieve the current course, lesson, learner progress, and recent evidence when context is missing or stale.",
  },
  check: {
    method: "dojo.lesson.verify",
    tool: "dojo_lesson_verify",
    description: "Check the learner's current work using the lesson's authored checks.",
  },
  complete: {
    method: "dojo.lesson.complete",
    tool: "dojo_lesson_complete",
    description: "Ask how to continue after a completed lesson. Review means give substantive feedback using the authored review topics, then call this tool again. Move on is advanced by the host. Pause ends cleanly.",
  },
} as const;

export const uiCapabilities = {
  ask: {
    method: "dojo.ui.ask",
    tool: "dojo_ui_ask",
    description: "Ask the learner an authored structured question in the Dojofoo UI and wait for their answer.",
  },
  show: {
    method: "dojo.ui.show",
    tool: "dojo_ui_show",
    description: "Show an authored lesson fragment in the Dojofoo UI by its supplied ID. After calling, do not announce, summarize, quote, or repeat the fragment; continue with at most one short connection or question.",
  },
} as const;

export interface DojoLessonContext {
  phase: "start" | "resume";
  course: { id: string };
  lesson: {
    id: string;
    title: string;
    objective: string;
    state: "completed" | "ongoing" | "not-started";
  };
  learner: {
    file: { path: string; language: string; content: string };
    latestCheck: unknown | null;
  };
}

export type LessonCapability = keyof typeof lessonCapabilities;
export type LessonCapabilityMethod = (typeof lessonCapabilities)[LessonCapability]["method"];
export type LessonCapabilityTool = (typeof lessonCapabilities)[LessonCapability]["tool"];

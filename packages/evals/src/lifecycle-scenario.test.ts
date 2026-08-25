import { describe, expect, it } from "vitest";
import { lifecyclePrompt, lifecycleSolution, scoreLifecycle } from "./lifecycle-scenario";

function passed(stage: Parameters<typeof scoreLifecycle>[0], text: string, name: string, tools: string[]) {
  return scoreLifecycle(stage, text, tools).find((assertion) => assertion.name === name)?.passed;
}

describe("lesson lifecycle scoring", () => {
  it("requires authored presentation when a learner lacks the covered concept", () => {
    expect(passed("stuck", "What distinction do you notice?", "shows the authored fragment once", ["dojo_ui_show"])).toBe(true);
    expect(passed("stuck", "What distinction do you notice?", "shows the authored fragment once", [])).toBe(false);
    expect(passed("stuck", "Three spaces form one whitespace run.", "does not paraphrase the fragment", ["dojo_ui_show"])).toBe(false);
  });

  it("requires the completion interaction without repeating its choices", () => {
    expect(passed("complete", "Nice work—this boundary is stable. We can pause here and pick it up when you're ready.", "completes exactly once", ["dojo_lesson_complete"])).toBe(true);
    expect(passed("complete", "Review, Move on, or Pause?", "does not print completion choices", ["dojo_lesson_complete"])).toBe(false);
    expect(passed("complete", "Are you ready to move on?", "honors the returned pause decision", ["dojo_lesson_complete"])).toBe(false);
  });

  it("requires a deep review and another completion prompt", () => {
    const review = "This is a method-chaining pipeline, not currying. Its order protects the trim boundary, and locale-sensitive casing is a separate trade-off.";
    expect(passed("review", review, "offers substantive review", ["dojo_lesson_complete", "dojo_lesson_complete"])).toBe(true);
    expect(passed("review", "Nice clean solution.", "offers substantive review", ["dojo_lesson_complete"])).toBe(false);
    expect(passed("review", review, "returns to the completion prompt", ["dojo_lesson_complete", "dojo_lesson_complete"])).toBe(true);
    expect(lifecyclePrompt("review")).toContain("replace(/\\\\s+/g");
    expect(lifecycleSolution("review")).toContain("replace(/\\s+/g");
  });

  it("treats compacted lesson context as sufficient to resume", () => {
    expect(passed("resume", "Now apply that idea to the next case.", "uses supplied compacted context", [])).toBe(true);
    expect(passed("resume", "I need context first.", "uses supplied compacted context", ["dojo_context"])).toBe(false);
    expect(lifecyclePrompt("resume")).toContain('"phase":"resume"');
    expect(lifecyclePrompt("resume")).toContain("<compaction_summary>");
  });
});

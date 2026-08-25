import { describe, expect, it } from "vitest";
import { lifecyclePrompt, lifecycleSolution, scoreLifecycle } from "./lifecycle-scenario";

function passed(stage: Parameters<typeof scoreLifecycle>[0], text: string, name: string, tools: string[]) {
  return scoreLifecycle(stage, text, tools).find((assertion) => assertion.name === name)?.passed;
}

describe("lesson lifecycle scoring", () => {
  it("requires adaptive instruction when a novice names an API they do not know", () => {
    const teaching = "JavaScript strings have a method that removes whitespace at both ends. For example, `\"  tea  \".trim()` gives `\"tea\"`. Try applying that method to the value your function receives.";
    expect(passed("novice", teaching, "recognizes missing API knowledge", [])).toBe(true);
    expect(passed("novice", teaching, "does not assemble the learner solution", [])).toBe(true);
    expect(passed("novice", "Use `return input.trim()`.", "does not assemble the learner solution", [])).toBe(false);
    expect(passed("novice", "This is function composition and currying. What comes next?", "uses plain language before jargon", [])).toBe(false);
    expect(passed("novice", "For example, `label.trim()` gives a new string. How would you apply that idea?", "teaches with a transferable example", [])).toBe(true);
    expect(passed("novice", "For example, `label.trim()` gives a new string. How would you apply that idea?", "asks the learner to apply the idea", [])).toBe(true);
  });

  it("requires authored presentation when a learner lacks the covered concept", () => {
    expect(passed("stuck", "What distinction do you notice?", "shows the authored fragment once", ["dojo_ui_show"])).toBe(true);
    expect(passed("stuck", "What distinction do you notice?", "shows the authored fragment once", [])).toBe(false);
    expect(passed("stuck", "Three spaces form one whitespace run.", "does not paraphrase the fragment", ["dojo_ui_show"])).toBe(false);
  });

  it("rejects the completed regex before review", () => {
    expect(passed("start", "Use `/\\s+/g` for the pattern.", "does not provide pasteable solution", [])).toBe(false);
    expect(passed("review", "Your `/\\s+/g` pattern matches each run.", "does not provide pasteable solution", [])).toBe(true);
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
    expect(passed("review", 'Swapping the steps gives `"--red-blue--"`.', "keeps whitespace-run examples accurate", ["dojo_lesson_complete", "dojo_lesson_complete"])).toBe(false);
    expect(passed("review", review, "does not open a new review quiz", ["dojo_lesson_complete", "dojo_ui_ask", "dojo_lesson_complete"])).toBe(false);
    expect(passed("review", "Call dojo_lesson_complete once more.", "keeps internal machinery private", ["dojo_lesson_complete", "dojo_lesson_complete"])).toBe(false);
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

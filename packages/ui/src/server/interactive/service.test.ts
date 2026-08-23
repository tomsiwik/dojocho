import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { advanceInteractiveLesson, answerInteractiveQuestion, getInteractiveLesson } from "./service";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function interactiveRoot(): string {
  const root = mkdtempSync(resolve(tmpdir(), "dojofoo-interactive-"));
  roots.push(root);
  const dojo = resolve(root, ".dojos", "recall");
  mkdirSync(resolve(dojo, "lessons"), { recursive: true });
  writeFileSync(resolve(root, ".dojorc"), JSON.stringify({ currentDojo: "recall", currentKata: null, editor: null }));
  writeFileSync(resolve(dojo, "dojo.json"), JSON.stringify({
    mode: "interactive",
    name: "@test/recall",
    version: "1.0.0",
    description: "Recall lesson",
    lessons: "lessons/intro.json",
  }));
  writeFileSync(resolve(dojo, "lessons", "intro.json"), JSON.stringify({
    id: "intro",
    title: "Recall",
    steps: [
      { id: "read", type: "present", title: "Read", content: "Remember this." },
      { id: "answer", type: "question", title: "Recall", prompt: "What?", answers: ["this"], explanation: "It was this." },
    ],
  }));
  return root;
}

describe("interactive lesson", () => {
  it("persists presentation, answer feedback, and completion", () => {
    const root = interactiveRoot();
    expect(getInteractiveLesson(root)).toMatchObject({ step: 0, complete: false, current: { id: "read" } });
    expect(advanceInteractiveLesson(root)).toMatchObject({ step: 1, current: { id: "answer" } });
    expect(answerInteractiveQuestion(root, "THIS")).toMatchObject({
      step: 1,
      response: { answer: "THIS", correct: true },
    });
    expect(getInteractiveLesson(root).response).toEqual({ answer: "THIS", correct: true });
    expect(advanceInteractiveLesson(root)).toMatchObject({ step: 2, complete: true, current: null });
  });

  it("requires an answer before advancing past a question", () => {
    const root = interactiveRoot();
    advanceInteractiveLesson(root);
    expect(() => advanceInteractiveLesson(root)).toThrow("Answer the question before continuing.");
  });
});
